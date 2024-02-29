
package dev.garz.minecrafttalk;

import org.bukkit.util.Vector;

public class Quaternion {
  private final double w, x, y, z;

  public Quaternion(double w, double x, double y, double z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static Vector rotate(Vector vector, Quaternion r) {
    return r.mul(Quaternion.from(vector)).mul(r.inverse()).toVector();
  }

  public static Vector rotate(Vector vector, Vector axis, double deg) {
    return Quaternion.rotate(vector, Quaternion.rotation(deg, axis));
  }

  public static Quaternion from(Vector vector) {
    return new Quaternion(0, vector.getX(), vector.getY(), vector.getZ());
  }

  public static Quaternion rotation(double deg, Vector axis) {
    axis = axis.normalize();
    deg = Math.toRadians(deg / 2);
    double sd = Math.sin(deg);
    return new Quaternion(Math.cos(deg), axis.getX() * sd, axis.getY() * sd, axis.getZ() * sd);
  }

  public Vector toVector() {
    return new Vector(x, y, z);
  }

  public Quaternion inverse() {
    double l = w * w + x * x + y * y + z * z;
    return new Quaternion(w / l, -x / l, -y / l, -z / l);
  }

  public Quaternion conjugate() {
    return new Quaternion(w, -x, -y, -z);
  }

  public Quaternion mul(Quaternion r) {
    double n0 = r.w * w - r.x * x - r.y * y - r.z * z;
    double n1 = r.w * x + r.x * w + r.y * z - r.z * y;
    double n2 = r.w * y - r.x * z + r.y * w + r.z * x;
    double n3 = r.w * z + r.x * y - r.y * x + r.z * w;
    return new Quaternion(n0, n1, n2, n3);
  }

  public double getW() {
    return w;
  }

  public double getX() {
    return x;
  }

  public double getY() {
    return y;
  }

  public double getZ() {
    return z;
  }
}
