package org.example.tv2p.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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
public class Site extends EntityObject {
    @Column
    private String title;

    @Column
    private String url;

    @OneToMany
    private List<SiteRow> siteRows;

    @OneToOne
    private Site nextToMore;
}
