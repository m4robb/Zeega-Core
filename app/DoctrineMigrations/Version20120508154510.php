<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration,
    Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your need!
 */
class Version20120508154510 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql");
        
        $this->addSql("DROP TABLE sequences_layers");
    }

    public function down(Schema $schema)
    {
        // this down() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql");
        
        $this->addSql("CREATE TABLE sequences_layers (sequence_id INT NOT NULL, layer_id BIGINT NOT NULL, INDEX IDX_49312052EA6EFDCD (layer_id), INDEX IDX_8568B41298FB19AE (sequence_id), PRIMARY KEY(sequence_id, layer_id)) ENGINE = InnoDB");
        $this->addSql("ALTER TABLE sequences_layers ADD CONSTRAINT FK_49312052EA6EFDCD FOREIGN KEY (layer_id) REFERENCES layer(id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE sequences_layers ADD CONSTRAINT FK_8568B41298FB19AE FOREIGN KEY (sequence_id) REFERENCES sequence(id) ON DELETE CASCADE");
    }
}