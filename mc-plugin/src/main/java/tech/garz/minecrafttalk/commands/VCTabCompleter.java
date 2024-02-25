package tech.garz.minecrafttalk.commands;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;

public class VCTabCompleter implements TabCompleter {
  ModifyTabCompleter modifyTabCompleter = new ModifyTabCompleter();

  @Override
  public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
    if (args.length == 1) {
      return CompletionUtils.filter(sender.isOp() ? VCCommand.ARG0s : VCCommand.PLAYER_ARG0s, args[0]);
    } else if (args.length == 2 && VCCommand.PLAYER_ARG0s.contains(args[0])) {
      if (sender.isOp()) {
        return CompletionUtils.completePlayers(args[1]);
      }
    } else if (args.length >= 2 && args[0].equals("modify")) {
      String[] modifyArgs = Arrays.copyOfRange(args, 1, args.length);
      return modifyTabCompleter.onTabComplete(sender, command, alias, modifyArgs);
    }
    return Collections.emptyList();
  }
}
