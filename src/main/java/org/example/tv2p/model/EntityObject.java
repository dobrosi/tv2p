package org.example.tv2p.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class EntityObject implements Serializable {
    @Id Long id;
}
