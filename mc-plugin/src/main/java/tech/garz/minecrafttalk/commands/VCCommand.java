package tech.garz.minecrafttalk.commands;

import java.util.Arrays;
import java.util.List;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import net.md_5.bungee.api.ChatColor;
import net.md_5.bungee.api.chat.BaseComponent;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.ComponentBuilder;
import tech.garz.minecrafttalk.MinecraftTalk;

public class VCCommand implements CommandExecutor {
  ModifyCommand modifyCommand = new ModifyCommand();

  public static final List<String> ARG0s = Arrays.asList("login", "logout", "modify");
  public static final List<String> PLAYER_ARG0s = Arrays.asList("login", "logout");

  void login(Player player, CommandSender sender) {
    MinecraftTalk.getAPI().login(player, link -> {
      if (link == null) {
        sender.sendMessage("§cFailed to create a login link. Please try again later.");
      } else {
        if (sender instanceof Player) {
          // Style message
          BaseComponent[] msg = new ComponentBuilder("Click here")
              .event(new ClickEvent(ClickEvent.Action.OPEN_URL, link)).color(ChatColor.DARK_AQUA).underlined(true)
              .append(" to login as ").color(ChatColor.RESET).underlined(false).append(player.getName()).append(".")
              .create();
          ((Player) sender).spigot().sendMessage(msg);
        } else {
          sender.sendMessage("Use this link to login as " + player.getName() + ": " + link);
        }
      }
    });
  }

  void logout(Player player, CommandSender sender) {
    MinecraftTalk.getAPI().logout(player, success -> {
      if (success) {
        if (sender == player) {
          sender.sendMessage("You were logged out successfully.");
        } else {
          sender.sendMessage("Successfully logged out " + player.getName() + ".");
        }
      } else {
        sender.sendMessage("§cLogout failed. Please contact us server admins!");
      }
    });
  }

  @Override
  public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    if (args.length == 0 || PLAYER_ARG0s.contains(args[0])) {
      // Get the player
      Player player = null;
      if (sender instanceof Player) {
        player = (Player) sender;
      }
      if (args.length >= 2) {
        player = MinecraftTalk.getInstance().getServer().getPlayerExact(args[1]);
        if (player == null) {
          sender.sendMessage("§cCould not find the player " + args[1] + ".");
          return true;
        }
      }
      if (player == null) {
        sender.sendMessage("§cPlease specify a player.");
        return true;
      }

      // You need op to control other players
      if (player != sender && !sender.isOp()) {
        sender.sendMessage("§cYou don't have the permission to login as other players.");
        return true;
      }

      if (args.length == 0 || args[0].equals("login")) {
        login(player, sender);
      } else if (args[0].equals("logout")) {
        logout(player, sender);
      }
      return true;
    } else if (args[0].equals("modify")) {
      String[] modifyArgs = Arrays.copyOfRange(args, 1, args.length);
      return modifyCommand.onCommand(sender, command, label, modifyArgs);
    }
    return false;
  }
}
