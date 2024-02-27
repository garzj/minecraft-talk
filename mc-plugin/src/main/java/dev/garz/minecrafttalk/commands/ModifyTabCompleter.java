package dev.garz.minecrafttalk.commands;

import java.util.Collections;
import java.util.List;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;

public class ModifyTabCompleter implements TabCompleter {
  @Override
  public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
    if (!sender.isOp() || args.length == 0)
      return Collections.emptyList();

    if (args.length == 1) {
      return CompletionUtils.filter(ModifyCommand.ARG0s, args[0]);
    } else if (!ModifyCommand.ARG0s.contains(args[0])) {
      return Collections.emptyList();
    }

    if (args.length == 2) {
      return CompletionUtils.filter(ModifyCommand.ARG1s, args[1]);
    } else if (!ModifyCommand.ARG1s.contains(args[1])) {
      return Collections.emptyList();
    }

    if (args.length == 3) {
      return CompletionUtils.completePlayers(args[2]);
    } else if (args[2].isEmpty()) {
      return Collections.emptyList();
    }

    if (args.length == 4) {
      return CompletionUtils.completePlayers(args[3], args[2]);
    }
    return Collections.emptyList();
  }
}
