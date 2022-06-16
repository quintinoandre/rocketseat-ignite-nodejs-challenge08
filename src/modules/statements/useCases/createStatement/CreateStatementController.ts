import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const {
      body: { amount, description },
    } = request;

    const user_id = request.params.user_id || request.user.id;

    const sender_id = request.params.user_id && request.user.id;

    const splittedPath = request.originalUrl.split("/");

    const type = sender_id
      ? OperationType.TRANSFER
      : (splittedPath[splittedPath.length - 1] as OperationType);

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      sender_id,
    });

    return response.status(201).json(statement);
  }
}
