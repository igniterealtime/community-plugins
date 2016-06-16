package org.ifsoft.lync.ucwa;


import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;


public final class Lists {
  public static <E>
  List<E> newArrayList() {
    return new ArrayList<E>();
  }

  public static <E>
  List<E> newArrayList(int capacity) {
    return new ArrayList<E>(capacity);
  }

  public static <E>
  List<E> newArrayList(Collection<? extends E> els) {
    return new ArrayList<E>(els);
  }

  public static <E>
  List<E> newArrayList(Iterable<? extends E> els) {
    List<E> list = new ArrayList<E>();
    for (E el : els) { list.add(el); }
    return list;
  }

  public static <E>
  List<E> newArrayList(E... els) {
    List<E> list = new ArrayList<E>(els.length);
    for (E el : els) { list.add(el); }
    return list;
  }

  public static <E>
  LinkedList<E> newLinkedList() {
    return new LinkedList<E>();
  }

  public static <E>
  LinkedList<E> newLinkedList(Collection<? extends E> els) {
    return new LinkedList<E>(els);
  }

  public static <E>
  LinkedList<E> newLinkedList(Iterable<? extends E> els) {
    LinkedList<E> list = new LinkedList<E>();
    for (E el : els) { list.add(el); }
    return list;
  }

  public static <E>
  LinkedList<E> newLinkedList(E... els) {
    LinkedList<E> list = new LinkedList<E>();
    for (E el : els) { list.add(el); }
    return list;
  }

  private Lists() { /* uninstantiable */ }
}
