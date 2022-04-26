package tech.garz.minecrafttalk.api;

import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import io.socket.engineio.client.transports.WebSocket;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.*;
import org.json.JSONException;
import org.json.JSONObject;

import tech.garz.minecrafttalk.MinecraftTalk;
import tech.garz.minecrafttalk.Util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

public class MinecraftTalkAPI implements Listener {
  private static final double MAX_TALK_DISTANCE = 16;
  private static final double MAX_TALK_DISTANCE_SQUARED = Math.pow(MAX_TALK_DISTANCE, 2);

  private Manager socketManager;
  private Socket socket;
  private boolean socketConnError = false;

  private HashMap<UUID, TalkingPlayer> talkingPlayers = new HashMap<>();

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
    opt.transports = new String[] { WebSocket.NAME };
    // Authorization
    opt.auth = Collections.singletonMap("cs", pl.getConfig().getString("conversation-secret"));

    // Socket setup
    socketManager = new Manager(socketURI);
    socket = socketManager.socket("/api/server", opt);

    // Debug
    pl.getLogger().info("Connecting to the voice chat server...");
    socket.on(Socket.EVENT_CONNECT, args -> {
      pl.getLogger().info("Connection established!");
      this.socketConnError = false;
    });
    socket.on("error", args -> {
      pl.getLogger().info("Socket error " + Arrays.toString(args));

      talkingPlayers.clear();
    });
    socket.on(Socket.EVENT_CONNECT_ERROR, args -> {
      if (!this.socketConnError) {
        pl.getLogger().info("Socket connection error " + Arrays.toString(args));
      }
      this.socketConnError = true;

      talkingPlayers.clear();
    });

    // Keep track of all talking players
    socket.on("talk", (data) -> {
      String strUuid = (String) data[0];
      boolean talking = (boolean) data[1];

      UUID uuid;
      try {
        uuid = UUID.fromString(strUuid);
      } catch (IllegalArgumentException e) {
        return;
      }

      if (talking) {
        if (!talkingPlayers.containsKey(uuid)) {
          talkingPlayers.put(uuid, new TalkingPlayer());
        }

        Player player = pl.getServer().getPlayer(uuid);
        if (player != null) {
          EmitVolumes(player);
        }
      } else {
        talkingPlayers.remove(uuid);
      }
    });

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

    socket.emit("login", player.getUniqueId().toString(), player.getName(), (Ack) args -> {
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
    // return (MAX_TALK_DISTANCE_SQUARED - distanceSquared) /
    // MAX_TALK_DISTANCE_SQUARED;

    return Math.sqrt(distanceSquared);
  }

  void EmitVolumes(Player player) {
    Bukkit.getScheduler().scheduleSyncDelayedTask(MinecraftTalk.getInstance(), () -> {
      if (!talkingPlayers.containsKey(player.getUniqueId()))
        return;
      TalkingPlayer talkingPlayer = talkingPlayers.get(player.getUniqueId());

      // Volumes to nearby players
      JSONObject volumes = new JSONObject();

      if (player.isOnline() && !player.isDead()) {
        for (Player neighbor : Util.getNearbyPlayers(player.getLocation(), MAX_TALK_DISTANCE + 1)) {
          if (player == neighbor)
            continue;

          if (!talkingPlayers.containsKey(neighbor.getUniqueId()))
            continue; // Ignore players, that aren't in the talk
          TalkingPlayer talkingNeighbor = talkingPlayers.get(neighbor.getUniqueId());

          String neighborUuid = neighbor.getUniqueId().toString();

          double distanceSquared = player.getEyeLocation().distanceSquared(neighbor.getEyeLocation());
          double vol = CalcVolume(distanceSquared);
          if (vol <= 0)
            continue; // Skip players that we can't hear

          try {
            volumes.put(neighborUuid, vol);

            talkingPlayer.conns.put(neighbor.getUniqueId(), neighbor);
            talkingNeighbor.conns.put(neighbor.getUniqueId(), player);
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }

      // Emit volumes of 0 for players that got out of range
      Set<UUID> connsToRemove = new HashSet<>();
      for (Player conn : talkingPlayer.conns.values()) {
        String connUuid = conn.getUniqueId().toString();

        if (!volumes.has(connUuid)) {
          try {
            volumes.put(connUuid, 0);
          } catch (JSONException e) {
            e.printStackTrace();
          }

          connsToRemove.add(conn.getUniqueId());
          TalkingPlayer otherPlayer = talkingPlayers.get(conn.getUniqueId());
          if (otherPlayer != null) {
            otherPlayer.conns.remove(player.getUniqueId());
          }
        }
      }
      for (UUID uuid : connsToRemove) {
        talkingPlayer.conns.remove(uuid);
      }

      // We don't wanna keep emitting empty volume maps
      int connCount = volumes.length();
      if (connCount > 0 || talkingPlayer.lastConnCount > 0) {
        socket.emit("update-vols", player.getUniqueId().toString(), volumes);
      }
      talkingPlayer.lastConnCount = connCount;
    }, 0L);
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
  private void onPlayerSneakToggle(PlayerToggleSneakEvent e) {
    EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerRespawn(PlayerRespawnEvent e) {
    EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerDeath(PlayerDeathEvent e) {
    EmitVolumes(e.getEntity());
  }

  @EventHandler
  private void onPlayerJoin(PlayerJoinEvent e) {
    EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerQuit(PlayerQuitEvent e) {
    EmitVolumes(e.getPlayer());
  }
}
