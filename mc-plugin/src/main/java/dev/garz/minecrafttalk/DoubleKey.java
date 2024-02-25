package dev.garz.minecrafttalk;

public class DoubleKey<T, U> {
  public T key0;
  public U key1;

  public DoubleKey(T key0, U key1) {
    this.key0 = key0;
    this.key1 = key1;
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof DoubleKey))
      return false;
    DoubleKey<?, ?> ref = (DoubleKey<?, ?>) obj;
    return (key0.equals(ref.key0) && key1.equals(ref.key1) || key0.equals(ref.key1) && key1.equals(ref.key0));
  }

  @Override
  public int hashCode() {
    return key0.hashCode() ^ key1.hashCode();
  }
}
