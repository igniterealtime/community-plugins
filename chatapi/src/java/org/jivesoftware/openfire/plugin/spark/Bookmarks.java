package org.jivesoftware.openfire.plugin.spark;

import java.util.List;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class Bookmarks.
 */
@XmlRootElement(name = "bookmarks")
public class Bookmarks {

	/** The bookmarks. */
	Collection<Bookmark> bookmarks;

	/**
	 * Instantiates a new bookmark entities.
	 */
	public Bookmarks() {

	}

	/**
	 * Instantiates a new bookmark entities.
	 *
	 * @param bookmarks
	 *            the bookmarks
	 */
	public Bookmarks(Collection<Bookmark> bookmarks) {
		this.bookmarks = bookmarks;
	}

	/**
	 * Gets the bookmarks.
	 *
	 * @return the bookmarks
	 */
	@XmlElement(name = "bookmark")
	public Collection<Bookmark> getBookmarks() {
		return bookmarks;
	}

	/**
	 * Sets the bookmarks.
	 *
	 * @param bookmarks
	 *            the new bookmarks
	 */
	public void setBookmarks(Collection<Bookmark> bookmarks) {
		this.bookmarks = bookmarks;
	}

}
