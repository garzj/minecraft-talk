package tech.garz.minecrafttalk;

import org.bukkit.entity.Player;

public class Util {
    public static String getPlayerId(Player p) {
        return p.getUniqueId().toString().replace("-", "");
    }
}
