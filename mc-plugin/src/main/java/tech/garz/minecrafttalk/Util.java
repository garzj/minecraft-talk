package tech.garz.minecrafttalk;

import java.util.ArrayList;
import java.util.List;

import org.bukkit.Location;
import org.bukkit.entity.Player;

public class Util {
  public static List<Player> getNearbyPlayers(Location loc, double maxDistance) {
    ArrayList<Player> players = new ArrayList<>();

    double maxDistanceSquared = Math.pow(maxDistance, 2);
    for (Player player : loc.getWorld().getPlayers()) {
      if (!player.isOnline() || player.isDead())
        continue;

      if (loc.distanceSquared(player.getLocation()) > maxDistanceSquared)
        continue;

      players.add(player);
    }

    return players;
  }
}
