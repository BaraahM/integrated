import { Injectable } from '@nestjs/common';
import { Langfuse } from 'langfuse';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LangfuseService {
  private langfuse: Langfuse;

  constructor(private configService: ConfigService) {
    this.langfuse = new Langfuse({
      secretKey: this.configService.get('LANGFUSE_SECRET_KEY'),
      publicKey: this.configService.get('LANGFUSE_PUBLIC_KEY'),
      baseUrl: this.configService.get(
        'LANGFUSE_BASE_URL',
        'https://cloud.langfuse.com',
      ),
    });
  }

  trace(name: string, input?: any) {
    return this.langfuse.trace({
      name,
      input,
    });
  }

  span(traceId: string, name: string, input?: any) {
    return this.langfuse.span({
      traceId,
      name,
      input,
    });
  }

  generation(traceId: string, name: string, input?: any) {
    return this.langfuse.generation({
      traceId,
      name,
      input,
    });
  }

  async shutdown() {
    await this.langfuse.shutdownAsync();
  }
}
