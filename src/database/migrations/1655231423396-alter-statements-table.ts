import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

class alterStatementsTable1655231423396 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({ name: "sender_id", type: "uuid", isNullable: true })
    );

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "FKStatementsSenderId",
        columnNames: ["sender_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw", "transfer"],
      })
    );

    /* await queryRunner.query(`
    ALTER TABLE statements
    ADD COLUMN sender_id uuid;
    `);

    await queryRunner.query(`
    ALTER TABLE statements
    ADD CONSTRAINT FKStatementsSenderId
    FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
    `); */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw"],
      })
    );

    await queryRunner.dropForeignKey("statements", "FKStatementsSenderId");

    await queryRunner.dropColumn("statements", "sender_id");

    /* await queryRunner.query(`
    ALTER TABLE statements
    ALTER TYPE type DROP VALUE 'transfer';
    `);

    await queryRunner.query(`
    ALTER TABLE statements
    DROP CONSTRAINT FKStatementsSenderId;
    `); */
  }
}

export { alterStatementsTable1655231423396 };
