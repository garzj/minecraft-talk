package dev.garz.minecrafttalk.api;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.bukkit.entity.Player;

public class TalkingPlayer {
  Map<UUID, Player> conns = new HashMap<>();
  int lastConnCount = 0;
}
