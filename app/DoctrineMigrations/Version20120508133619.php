<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration,
    Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your need!
 */
class Version20120508133619 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql");
        
        //$this->addSql("ALTER TABLE frame DROP layers");
        $this->addSql("ALTER TABLE project ADD authors VARCHAR(255) DEFAULT NULL, ADD cover_image VARCHAR(255) DEFAULT NULL");
    }

    public function down(Schema $schema)
    {
        // this down() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql");
        
        $this->addSql("ALTER TABLE frame ADD layers LONGTEXT DEFAULT NULL COMMENT '(DC2Type:array)'");
        $this->addSql("ALTER TABLE project ADD attr LONGTEXT DEFAULT NULL COMMENT '(DC2Type:array)', DROP authors, DROP cover_image");
    }
}