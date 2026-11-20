
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function GalleryList({ galleries }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const filteredGalleries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return galleries.filter((gallery) => {
            const matchesSearch = gallery.title.toLowerCase().includes(query);

            const matchesStatus =
                status === "all" ||
                (status === "active" && gallery.isActive) ||
                (status === "inactive" && !gallery.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [galleries, search, status]);

    return (
        <section className="gallery-list-section">
            <div className="gallery-list-toolbar">
                <input
                    className="admin-input gallery-search"
                    type="search"
                    placeholder="Search galleries..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <select
                    className="admin-input gallery-filter"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                >
                    <option value="all">All galleries</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="gallery-list-heading">
                <span>Gallery</span>
                <span>Status</span>
                <span>Photos</span>
                <span>Visitors</span>
                <span>Created</span>
            </div>

            {filteredGalleries.length ? (
                <div className="gallery-list">
                    {filteredGalleries.map((gallery) => (
                        <Link
                            className="gallery-list-item"
                            href={`/admin/galleries/${gallery.id}`}
                            key={gallery.id}
                        >
                            <div className="gallery-list-title">
                                <strong>{gallery.title}</strong>
                                <small>
                                    Updated{" "}
                                    {new Date(gallery.updatedAt).toLocaleDateString("en-IN")}
                                </small>
                            </div>

                            <div>
                                <span
                                    className={`admin-status ${gallery.isActive ? "is-active" : "is-inactive"
                                        }`}
                                >
                                    {gallery.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <span className="gallery-list-number">
                                {gallery._count.media}
                            </span>

                            <span className="gallery-list-number">
                                {gallery._count.visitors}
                            </span>

                            <span className="gallery-list-date">
                                {new Date(gallery.createdAt).toLocaleDateString("en-IN")}
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="gallery-empty-state">
                    <h3>No galleries found</h3>
                    <p>Try changing your search or status filter.</p>
                </div>
            )}

            <p className="gallery-results-count">
                Showing {filteredGalleries.length} of {galleries.length} galleries
            </p>
        </section>
    );
}

