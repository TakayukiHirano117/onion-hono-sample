import { DomainError } from "../../../domain/shared/exception/domain_error";
import { BadRequestError, type ApplicationError } from "./application_error";

export function mapDomainError(error: DomainError): ApplicationError {
  return new BadRequestError(error.message);
}
