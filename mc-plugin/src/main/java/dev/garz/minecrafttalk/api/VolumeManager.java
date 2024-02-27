package dev.garz.minecrafttalk.api;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.HandlerList;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.event.player.PlayerTeleportEvent;
import org.bukkit.event.player.PlayerToggleSneakEvent;

import dev.garz.minecrafttalk.MinecraftTalk;

public class VolumeManager implements Listener {
  private double defaultMaxDistance;
  private Map<UUID, Map<UUID, Double>> maxDistances = new HashMap<>();

  private MinecraftTalk instance;
  private MinecraftTalkAPI talkApi;

  public VolumeManager(MinecraftTalkAPI talkApi) {
    this.talkApi = talkApi;

    instance = MinecraftTalk.getInstance();
    instance.getServer().getPluginManager().registerEvents(this, MinecraftTalk.getInstance());

    resetDefaultMaxDistance();
  }

  private void EmitAllVolumes() {
    for (Player p : instance.getServer().getOnlinePlayers()) {
      talkApi.EmitVolumes(p);
    }
  }

  public void setDefaultMaxDistance(double value) {
    instance.getConfig().set("default-max-distance", value);
    defaultMaxDistance = value;
    instance.saveConfig();
    EmitAllVolumes();
  }

  public void resetDefaultMaxDistance() {
    setDefaultMaxDistance(16.0);
    EmitAllVolumes();
  }

  public boolean setMaxDistance(Player dst, Player src, double maxDistance) {
    if (dst == src)
      return false;
    maxDistances.computeIfAbsent(dst.getUniqueId(), (key) -> new HashMap<>()).put(src.getUniqueId(), maxDistance);
    talkApi.EmitVolumes(dst);
    return true;
  }

  public boolean clearMaxDistance(Player dst, Player src) {
    if (dst == src)
      return false;
    maxDistances.computeIfPresent(dst.getUniqueId(), (key, fromMap) -> {
      fromMap.remove(src.getUniqueId());
      return fromMap.isEmpty() ? null : fromMap;
    });
    talkApi.EmitVolumes(dst);
    return true;
  }

  public double calcVolume(Player dst, Player src) {
    Map<UUID, Double> fromMap = maxDistances.get(dst.getUniqueId());
    double maxDistance = fromMap == null ? defaultMaxDistance
        : fromMap.getOrDefault(src.getUniqueId(), defaultMaxDistance);
    if (Double.isInfinite(maxDistance))
      return 1;
    if (dst.getWorld() != src.getWorld()
        || Arrays.stream(new Player[] { dst, src }).anyMatch(p -> !p.isOnline() || p.isDead())) {
      return 0;
    }
    if (dst.getEyeLocation().distanceSquared(src.getEyeLocation()) > Math.pow(maxDistance, 2)) {
      return 0;
    }
    return Math.max(0, (maxDistance - dst.getEyeLocation().distance(src.getEyeLocation())) / maxDistance);
  }

  public void disable() {
    HandlerList.unregisterAll(this);
  }

  @EventHandler
  private void onPlayerMove(PlayerMoveEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerTeleport(PlayerTeleportEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerSneakToggle(PlayerToggleSneakEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerRespawn(PlayerRespawnEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerDeath(PlayerDeathEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getEntity());
  }

  @EventHandler
  private void onPlayerJoin(PlayerJoinEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerQuit(PlayerQuitEvent e) {
    talkApi.EmitBidirectionalVolumes(e.getPlayer());
  }
}
