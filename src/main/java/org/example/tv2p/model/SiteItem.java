package org.example.tv2p.model;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SiteItem extends EntityObject {
    private String title;

    private String imageUrl;

    private String url;
}
