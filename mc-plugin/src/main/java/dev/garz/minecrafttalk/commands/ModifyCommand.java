package dev.garz.minecrafttalk.commands;

import java.util.Arrays;
import java.util.List;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import dev.garz.minecrafttalk.MinecraftTalk;

public class ModifyCommand implements CommandExecutor {
  public static final List<String> ARG0s = Arrays.asList("set", "clear");

  @Override
  public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    if (!sender.isOp())
      return false;

    if (args.length < 1)
      return false;
    if (!ARG0s.contains(args[0]))
      return false;

    if (args.length < 2)
      return false;
    if (args[1].equals("maxdistance")) {
      if (args.length < 4)
        return false;
      Player p1 = MinecraftTalk.getInstance().getServer().getPlayerExact(args[2]);
      Player p2 = MinecraftTalk.getInstance().getServer().getPlayerExact(args[3]);
      if (p1 == null || p2 == null) {
        sender.sendMessage("§cCould not find the player " + (p1 == null ? args[2] : args[3]) + ".");
        return true;
      }

      boolean success;
      if (args[0].equals("set")) {
        if (args.length < 5)
          return false;

        double dist;
        try {
          dist = Double.parseDouble(args[4]);
        } catch (NumberFormatException e) {
          return false;
        }

        success = MinecraftTalk.getAPI().getVolumeManager().setMaxDistance(p1, p2, dist);
      } else {
        success = MinecraftTalk.getAPI().getVolumeManager().clearMaxDistance(p1, p2);
      }
      if (!success) {
        sender.sendMessage("§cThe specified players cannot be the same.");
      }
      return true;
    }

    return false;
  }
}
