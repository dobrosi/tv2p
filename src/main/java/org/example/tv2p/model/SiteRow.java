package org.example.tv2p.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SiteRow extends SiteItem {
    @Column
    private String title;

    @Column
    private String description;

    @Column
    private String url;

    @OneToMany
    private List<SiteItem> siteItems;
}
