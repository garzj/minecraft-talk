package dev.garz.minecrafttalk.commands;

import java.util.List;
import java.util.stream.Collectors;

import org.bukkit.entity.Player;

import dev.garz.minecrafttalk.MinecraftTalk;

public class CompletionUtils {
  public static List<String> completePlayers(String typed) {
    return filter(MinecraftTalk.getInstance().getServer().getOnlinePlayers().stream().map(Player::getName)
        .collect(Collectors.toList()), typed);
  }

  public static List<String> completePlayers(String typed, String excludeName) {
    return filter(MinecraftTalk.getInstance().getServer().getOnlinePlayers().stream().map(Player::getName)
        .filter(n -> !n.equals(excludeName)).collect(Collectors.toList()), typed);
  }

  public static List<String> filter(List<String> completions, String typed) {
    return completions.stream().filter(a -> a.startsWith(typed)).collect(Collectors.toList());
  }
}
