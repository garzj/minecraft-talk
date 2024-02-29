package dev.garz.minecrafttalk.api;

import org.bukkit.entity.Player;
import org.bukkit.util.Vector;
import org.json.JSONArray;
import org.json.JSONObject;

public class AudioState {
  boolean shouldPersist = false;

  private Vector origin;
  private double volume;

  AudioState(Player dst, Player src, MinecraftTalkAPI talkAPI) {
    VolumeManager volumeManager = talkAPI.getVolumeManager();

    if (dst == src || !talkAPI.isTalking(dst.getUniqueId()) || !talkAPI.isTalking(src.getUniqueId()))
      return;

    Vector offset = volumeManager.getAudioOffset(dst, src);
    double maxDistance = volumeManager.getCurrentMaxDistance(dst, src);
    volume = volumeManager.calcVolume(dst, src);

    if (volume <= 0 && offset == null)
      return;

    if (offset != null) {
      // todo: implement threshold config
      double connThreshold = 4;
      double connMaxDist = maxDistance + connThreshold;
      if (offset.lengthSquared() > connMaxDist * connMaxDist)
        return;
      double magnitude = offset.length();
      if (magnitude > connMaxDist)
        return;
      shouldPersist = true;

      origin = offset.multiply(1 / magnitude);
    } else {
      origin = null;
    }
  }

  public boolean shouldPersist() {
    return shouldPersist;
  }

  public JSONObject encodeJSON() {
    if (!shouldPersist)
      return null;

    JSONObject jsonState = new JSONObject();

    if (origin != null) {
      JSONArray jsonOrigin = new JSONArray();
      jsonOrigin.put(origin.getX());
      jsonOrigin.put(origin.getY());
      jsonOrigin.put(origin.getZ());
      jsonState.put("origin", jsonOrigin);
    }

    jsonState.put("volume", volume);

    return jsonState;
  }
}
