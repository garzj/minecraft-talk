package dev.garz.minecrafttalk.api;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

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

import dev.garz.minecrafttalk.DoubleKey;
import dev.garz.minecrafttalk.MinecraftTalk;

public class VolumeManager implements Listener {
  private double defaultMaxDistance;
  private Map<DoubleKey<Player, Player>, Double> maxDistances = new HashMap<>();

  private MinecraftTalkAPI talkApi;

  public VolumeManager(MinecraftTalkAPI talkApi) {
    this.talkApi = talkApi;

    MinecraftTalk.getInstance().getServer().getPluginManager().registerEvents(this, MinecraftTalk.getInstance());

    resetDefaultMaxDistance();
  }

  private void EmitAllVolumes() {
    for (Player p : MinecraftTalk.getInstance().getServer().getOnlinePlayers()) {
      talkApi.EmitVolumes(p);
    }
  }

  public void setDefaultMaxDistance(double value) {
    defaultMaxDistance = value;
    EmitAllVolumes();
  }

  public void resetDefaultMaxDistance() {
    defaultMaxDistance = MinecraftTalk.getInstance().getConfig().getDouble("default-max-distance");
    EmitAllVolumes();
  }

  public boolean setMaxDistance(Player p1, Player p2, double maxDistance) {
    if (p1 == p2)
      return false;
    maxDistances.put(new DoubleKey<>(p1, p2), maxDistance);
    talkApi.EmitVolumes(p1);
    talkApi.EmitVolumes(p2);
    return true;
  }

  public boolean clearMaxDistance(Player p1, Player p2) {
    if (p1 == p2)
      return false;
    maxDistances.remove(new DoubleKey<>(p1, p2));
    talkApi.EmitVolumes(p1);
    talkApi.EmitVolumes(p2);
    return true;
  }

  public double calcVolume(Player p1, Player p2) {
    double maxDistance = maxDistances.getOrDefault(new DoubleKey<>(p1, p2), defaultMaxDistance);
    if (Double.isInfinite(maxDistance))
      return 1;
    if (p1.getWorld() != p2.getWorld()
        || Arrays.stream(new Player[] { p1, p2 }).anyMatch(p -> !p.isOnline() || p.isDead())) {
      return 0;
    }
    if (p1.getEyeLocation().distanceSquared(p2.getEyeLocation()) > Math.pow(maxDistance, 2)) {
      return 0;
    }
    return Math.max(0, (maxDistance - p1.getEyeLocation().distance(p2.getEyeLocation())) / maxDistance);
  }

  public void disable() {
    HandlerList.unregisterAll(this);
  }

  @EventHandler
  private void onPlayerMove(PlayerMoveEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerTeleport(PlayerTeleportEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerSneakToggle(PlayerToggleSneakEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerRespawn(PlayerRespawnEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerDeath(PlayerDeathEvent e) {
    talkApi.EmitVolumes(e.getEntity());
  }

  @EventHandler
  private void onPlayerJoin(PlayerJoinEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }

  @EventHandler
  private void onPlayerQuit(PlayerQuitEvent e) {
    talkApi.EmitVolumes(e.getPlayer());
  }
}
