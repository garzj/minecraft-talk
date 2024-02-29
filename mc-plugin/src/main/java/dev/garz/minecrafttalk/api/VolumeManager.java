package dev.garz.minecrafttalk.api;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.bukkit.Location;
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
import org.bukkit.util.Vector;

import dev.garz.minecrafttalk.MinecraftTalk;
import dev.garz.minecrafttalk.Quaternion;

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

  private void EmitAllAudioStates() {
    for (Player p : instance.getServer().getOnlinePlayers()) {
      talkApi.EmitAudioUpdate(p);
    }
  }

  public void setDefaultMaxDistance(double value) {
    instance.getConfig().set("default-max-distance", value);
    defaultMaxDistance = value;
    instance.saveConfig();
    EmitAllAudioStates();
  }

  public void resetDefaultMaxDistance() {
    setDefaultMaxDistance(16.0);
    EmitAllAudioStates();
  }

  public boolean setMaxDistance(Player dst, Player src, double maxDistance) {
    if (dst == src)
      return false;
    maxDistances.computeIfAbsent(dst.getUniqueId(), (key) -> new HashMap<>()).put(src.getUniqueId(), maxDistance);
    talkApi.EmitAudioUpdate(dst);
    return true;
  }

  public boolean clearMaxDistance(Player dst, Player src) {
    if (dst == src)
      return false;
    maxDistances.computeIfPresent(dst.getUniqueId(), (key, fromMap) -> {
      fromMap.remove(src.getUniqueId());
      return fromMap.isEmpty() ? null : fromMap;
    });
    talkApi.EmitAudioUpdate(dst);
    return true;
  }

  public double getCurrentMaxDistance(Player dst, Player src) {
    Map<UUID, Double> fromMap = maxDistances.get(dst.getUniqueId());
    return fromMap == null ? defaultMaxDistance
        : fromMap.getOrDefault(src.getUniqueId(), defaultMaxDistance);
  }

  Vector getAudioOffset(Player dst, Player src) {
    if (dst.getWorld() != src.getWorld()
        || Arrays.stream(new Player[] { dst, src }).anyMatch(p -> !p.isOnline() || p.isDead())) {
      return null;
    }
    Location dstLoc = dst.getEyeLocation();
    Vector offset = dstLoc.subtract(src.getEyeLocation()).toVector();
    offset = Quaternion.rotate(offset, new Vector(0, 1, 0), -dstLoc.getYaw());
    offset = Quaternion.rotate(offset, new Vector(1, 0, 0), -dstLoc.getPitch());
    return offset;
  }

  public double calcVolume(Player dst, Player src, Vector offset, double maxDistance) {
    if (Double.isInfinite(maxDistance))
      return 1;
    if (offset == null)
      return 0;
    if (offset.lengthSquared() > maxDistance * maxDistance)
      return 0;
    return Math.max(0, (maxDistance - offset.length()) / maxDistance);
  }

  public double calcVolume(Player dst, Player src, Vector offset) {
    return calcVolume(dst, src, offset, getCurrentMaxDistance(dst, src));
  }

  public double calcVolume(Player dst, Player src) {
    return calcVolume(dst, src, getAudioOffset(dst, src));
  }

  public void disable() {
    HandlerList.unregisterAll(this);
  }

  @EventHandler
  private void onPlayerMove(PlayerMoveEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }

  @EventHandler
  private void onPlayerTeleport(PlayerTeleportEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }

  @EventHandler
  private void onPlayerSneakToggle(PlayerToggleSneakEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }

  @EventHandler
  private void onPlayerRespawn(PlayerRespawnEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }

  @EventHandler
  private void onPlayerDeath(PlayerDeathEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getEntity());
  }

  @EventHandler
  private void onPlayerJoin(PlayerJoinEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }

  @EventHandler
  private void onPlayerQuit(PlayerQuitEvent e) {
    talkApi.EmitBidirectionalAudioUpdate(e.getPlayer());
  }
}
