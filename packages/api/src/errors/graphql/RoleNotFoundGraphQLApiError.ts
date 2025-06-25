import { GraphQLApiError } from '../GraphQLApiErrors';

export class GraphQLApiErrorRoleNotFound extends GraphQLApiError {
  constructor() {
    super('role_not_found', 'Role not found');
  }
}
