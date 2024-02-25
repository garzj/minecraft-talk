package dev.garz.minecrafttalk;

import org.bukkit.command.PluginCommand;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import dev.garz.minecrafttalk.api.MinecraftTalkAPI;
import dev.garz.minecrafttalk.commands.VCCommand;
import dev.garz.minecrafttalk.commands.VCTabCompleter;

public final class MinecraftTalk extends JavaPlugin {
  public static MinecraftTalk INSTANCE;

  private static MinecraftTalkAPI talkAPI;

  @Override
  public void onEnable() {
    INSTANCE = this;

    loadConfig();

    registerCommands();

    talkAPI = new MinecraftTalkAPI();
  }

  @Override
  public void onDisable() {
    talkAPI.disable();
  }

  public static MinecraftTalk getInstance() {
    return INSTANCE;
  }

  public static MinecraftTalkAPI getAPI() {
    return talkAPI;
  }

  private void loadConfig() {
    FileConfiguration config = getConfig();

    config.options().copyDefaults(true);
    config.addDefault("socket-uri", "http://localhost:8080/");
    config.addDefault("conversation-secret", "LhKB7U1svggGYx7ZGaLb");
    config.addDefault("default-max-distance", 16);

    saveConfig();
  }

  private void registerCommands() {
    PluginCommand voiceChatCmd = getCommand("vc");
    voiceChatCmd.setExecutor(new VCCommand());
    voiceChatCmd.setTabCompleter(new VCTabCompleter());
  }
}
