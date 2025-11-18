import { Controller, Sse } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';

@Controller('notification')
export class NotificationController {
    constructor() {}

    // @Sse('/sse')
    // sse(): Observable<MessageEvent> {
    //     return interval(10000000).pipe(
    //         map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
    //     )
    // }
}
