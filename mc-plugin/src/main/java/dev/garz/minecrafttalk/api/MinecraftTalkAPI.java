package dev.garz.minecrafttalk.api;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.json.JSONObject;

import dev.garz.minecrafttalk.MinecraftTalk;
import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import io.socket.engineio.client.transports.WebSocket;

public class MinecraftTalkAPI {
  private VolumeManager volumeManager = new VolumeManager(this);

  private Manager socketManager;
  private Socket socket;
  private boolean socketConnError = false;

  private HashMap<UUID, TalkingPlayer> talkingPlayers = new HashMap<>();

  public MinecraftTalkAPI() {
    setupSocket();
  }

  public VolumeManager getVolumeManager() {
    return volumeManager;
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
          EmitBidirectionalAudioUpdate(player);
        }
      } else {
        talkingPlayers.remove(uuid);
      }
    });

    socket.connect();
  }

  public void disable() {
    this.volumeManager.disable();
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

  public boolean isTalking(UUID uuid) {
    return talkingPlayers.containsKey(uuid);
  }

  void EmitBidirectionalAudioUpdate(Player center) {
    for (Player neighbor : MinecraftTalk.getInstance().getServer().getOnlinePlayers()) {
      EmitAudioUpdate(neighbor, center);
    }
    EmitAudioUpdate(center);
  }

  void EmitAudioUpdate(Player dst, Player src) {
    Bukkit.getScheduler().scheduleSyncDelayedTask(MinecraftTalk.getInstance(), () -> {
      if (!talkingPlayers.containsKey(dst.getUniqueId()))
        return;
      TalkingPlayer talkingDst = talkingPlayers.get(dst.getUniqueId());

      JSONObject jsonConns = new JSONObject();

      AudioState state = new AudioState(dst, src, this);
      if (state.shouldPersist()) {
        jsonConns.put(src.getUniqueId().toString(), state.encodeJSON());
        talkingDst.srcConns.add(src.getUniqueId());
      } else if (talkingDst.srcConns.contains(src.getUniqueId())) {
        jsonConns.put(src.getUniqueId().toString(), JSONObject.NULL);
        talkingDst.srcConns.remove(src.getUniqueId());
      }

      if (jsonConns.length() == 0)
        return;
      socket.emit("update-conns", dst.getUniqueId().toString(), jsonConns);
    }, 0L);
  }

  void EmitAudioUpdate(Player dst) {
    Bukkit.getScheduler().scheduleSyncDelayedTask(MinecraftTalk.getInstance(), () -> {
      if (!talkingPlayers.containsKey(dst.getUniqueId()))
        return;
      TalkingPlayer talkingDst = talkingPlayers.get(dst.getUniqueId());

      // Connection data to nearby players
      JSONObject jsonConns = new JSONObject();

      for (Player src : MinecraftTalk.getInstance().getServer().getOnlinePlayers()) {
        AudioState state = new AudioState(dst, src, this);
        if (!state.shouldPersist())
          continue;

        jsonConns.put(src.getUniqueId().toString(), state.encodeJSON());
        talkingDst.srcConns.add(src.getUniqueId());
      }

      // Send null for players that got out of range
      Set<UUID> connsToRemove = new HashSet<>();
      for (UUID uuid : talkingDst.srcConns) {
        String connUuid = uuid.toString();
        if (!jsonConns.has(connUuid)) {
          jsonConns.put(connUuid, JSONObject.NULL);
          connsToRemove.add(uuid);
        }
      }
      for (UUID connUuid : connsToRemove) {
        talkingDst.srcConns.remove(connUuid);
      }

      // We don't wanna keep emitting empty objects
      if (jsonConns.length() == 0)
        return;
      socket.emit("update-conns", dst.getUniqueId().toString(), jsonConns);
    }, 0L);
  }
}
