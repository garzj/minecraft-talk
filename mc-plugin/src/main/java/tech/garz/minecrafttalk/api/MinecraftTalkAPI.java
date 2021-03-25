package tech.garz.minecrafttalk.api;

import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import io.socket.engineio.client.transports.WebSocket;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.*;
import tech.garz.minecrafttalk.MinecraftTalk;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collections;

public class MinecraftTalkAPI implements Listener {
    private Manager socketManager;
    private Socket socket;

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
            String link = (String)args[0];
            loginCallback.run(link);
        });
    }

    public void logout(Player player, VCLogoutCallback logoutCallback) {
        if (!socket.connected()) {
            logoutCallback.run(false);
            return;
        }

        socket.emit("logout", player.getUniqueId().toString(), (Ack) args -> {
            boolean success = (boolean)args[0];
            logoutCallback.run(success);
        });
    }

    // TALK

    void EmitDistances(Player p) {
        throw new NotImplementedException();
    }

    @EventHandler
    private void onPlayerMove(PlayerMoveEvent e) {
    }

    @EventHandler
    private void onPlayerTeleport(PlayerTeleportEvent e) {
    }

    @EventHandler
    private void onPlayerQuit(PlayerQuitEvent e) {
    }

    @EventHandler
    private void onPlayerJoin(PlayerJoinEvent e) {
    }

    // ...
}
