package tech.garz.minecrafttalk.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import tech.garz.minecrafttalk.MinecraftTalk;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class VCTabCompleter implements TabCompleter {
  @Override
  public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
    if (args.length == 1) {
      // Return available commands
      return VCCommand.ARG0s.stream().filter(cmd -> cmd.startsWith(args[0])).collect(Collectors.toList());
    } else if (args.length == 2 && VCCommand.ARG0s.contains(args[0])) {
      // Return available players to ops
      if (sender.isOp()) {
        return MinecraftTalk.getInstance().getServer().getOnlinePlayers().stream().map(Player::getName)
            .collect(Collectors.toList());
      }
    }
    return Collections.emptyList();
  }
}
