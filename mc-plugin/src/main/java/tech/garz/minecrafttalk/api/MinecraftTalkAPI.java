package tech.garz.minecrafttalk.api;

import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import io.socket.engineio.client.transports.WebSocket;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.*;
import org.json.simple.JSONArray;
import tech.garz.minecrafttalk.MinecraftTalk;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

public class MinecraftTalkAPI implements Listener {
    private static final double MAX_TALK_DISTANCE = 16;
    private static final double MAX_TALK_DISTANCE_SQUARED = Math.pow(MAX_TALK_DISTANCE, 2);

    private Manager socketManager;
    private Socket socket;

    private Map<Player, Integer> lastNeighborCount = new HashMap<>();

    public MinecraftTalkAPI() {
        MinecraftTalk.getInstance().getServer().getPluginManager().registerEvents(this, MinecraftTalk.getInstance());

        setupSocket();
    }

    // SOCKET SETUP

    private void setupSocket() {
        MinecraftTalk pl = MinecraftTalk.getInstance();

        // Get socket URI
        URI socketURI;
        try {
            socketURI = new URI(pl.getConfig().getString("socket-uri"));
        } catch (URISyntaxException e) {
            pl.getLogger().warning("§eInvalid configuration detected: socket-uri\nPlease provide a valid uri.");
            return;
        }

        // Socket config
        IO.Options opt = new IO.Options();
        opt.forceNew = true;
        opt.reconnectionAttempts = Integer.MAX_VALUE;
        opt.reconnection = true;
        opt.transports = new String[]{WebSocket.NAME};
        // Authorization
        opt.auth = Collections.singletonMap("cs", pl.getConfig().getString("conversation-secret"));

        // Socket setup
        socketManager = new Manager(socketURI);
        socket = socketManager.socket("/server", opt);

        // Debug
        pl.getLogger().info("Connecting to the voice chat server...");
        socket.on(Socket.EVENT_CONNECT, args -> pl.getLogger().info("Connection established!"));
        socket.on("error", args -> pl.getLogger().info("Socket error " + Arrays.toString(args)));
        socket.on(Socket.EVENT_CONNECT_ERROR, args -> pl.getLogger().info("Socket connection error " + Arrays.toString(args)));

        socket.connect();

        // We can use the lastNeighborCount map to keep track of all talking players
        socket.on("talk", (data) -> {
            String uuid = (String) data[0];
            boolean talking = (boolean) data[1];

            Player player = pl.getServer().getPlayer(UUID.fromString(uuid));
            if (player == null) return;

            if (talking) {
                lastNeighborCount.putIfAbsent(player, 0);
            } else {
                lastNeighborCount.remove(player);
            }
        });
    }

    public void disable() {
        socket.off();
        socket.disconnect();
        socketManager.off();
    }

    // LOGIN / LOGOUT

    public void login(Player player, VCLoginCallback loginCallback) {
        if (!socket.connected()) {
            loginCallback.run(null);
            return;
        }

        socket.emit("login", player.getUniqueId().toString(), (Ack) args -> {
            String link = (String) args[0];
            loginCallback.run(link);
        });
    }

    public void logout(Player player, VCLogoutCallback logoutCallback) {
        if (!socket.connected()) {
            logoutCallback.run(false);
            return;
        }

        socket.emit("logout", player.getUniqueId().toString(), (Ack) args -> {
            boolean success = (boolean) args[0];
            logoutCallback.run(success);
        });
    }

    // TALK

    double CalcVolume(double distanceSquared) {
        return (MAX_TALK_DISTANCE_SQUARED - distanceSquared) / MAX_TALK_DISTANCE_SQUARED;
    }

    void EmitVolumes(Player player) {
        if (!lastNeighborCount.containsKey(player)) return;

        // Calc all volumes to player neighbors
        List<JSONArray> volumes = new ArrayList<>();

        for (Entity entity : player.getNearbyEntities(MAX_TALK_DISTANCE, MAX_TALK_DISTANCE, MAX_TALK_DISTANCE)) {
            if (entity instanceof Player) {
                Player neighbor = (Player) entity;
                if (!lastNeighborCount.containsKey(neighbor)) continue;  // Ignore players, that aren't in the talk
                String neighborUuid = neighbor.getUniqueId().toString();

                double distanceSquared = player.getEyeLocation().distanceSquared(neighbor.getEyeLocation());
                double vol = CalcVolume(distanceSquared);
                if (vol <= 0) continue; // Skip players that we can't hear

                JSONArray volumeInfo = new JSONArray();
                volumeInfo.add(neighborUuid);
                volumeInfo.add(vol);
                volumes.add(volumeInfo);
            }
        }

        // We don't wanna keep emitting empty volume lists
        int neighborCount = volumes.size();
        if (neighborCount > 0 || lastNeighborCount.get(player) > 0) {
            socket.emit("update-vols", player.getUniqueId().toString(), volumes);
        }

        lastNeighborCount.put(player, neighborCount);
    }

    @EventHandler
    private void onPlayerMove(PlayerMoveEvent e) {
        EmitVolumes(e.getPlayer());
    }

    @EventHandler
    private void onPlayerTeleport(PlayerTeleportEvent e) {
        EmitVolumes(e.getPlayer());
    }

    @EventHandler
    private void onPlayerJoin(PlayerJoinEvent e) {
        EmitVolumes(e.getPlayer());
    }

    @EventHandler
    private void onPlayerSneakToggle(PlayerToggleSneakEvent e) {
        EmitVolumes(e.getPlayer());
    }

    @EventHandler
    private void onPlayerQuit(PlayerQuitEvent e) {
        if (!lastNeighborCount.containsKey(e.getPlayer())) return;

        socket.emit("update-vols", e.getPlayer().getUniqueId().toString(), Collections.emptyList());
    }
}
