package org.example.tv2p.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class EntityObject {
    @Id Long id;
}
