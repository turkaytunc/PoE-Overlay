import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Point } from '@app/type';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WindowService } from '../window.service';
import { DialogRefService } from './dialog-ref.service';

export interface DialogSettings {
    width: number;
    height: number;
    position?: Point;
}

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(
        private readonly dialog: MatDialog,
        private readonly dialogRef: DialogRefService,
        private readonly window: WindowService) { }

    public open<T, D, R>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        data: D,
        { position: point, width, height }: DialogSettings): Observable<R> {
        const bounds = this.window.getBounds();

        const local = point
            ? this.window.convertToLocal(point)
            : { x: bounds.width * 0.5, y: bounds.height * 0.5 };

        const left = Math.max(Math.min(local.x - width * 0.5, bounds.width - width), 0);
        const top = Math.max(Math.min(local.y - height * 0.5, bounds.height - height), 0);

        this.window.enableInput();
        const dialogRef = this.dialog.open(componentOrTemplateRef, {
            position: {
                left: `${left}px`,
                top: `${top}px`,
            },
            backdropClass: 'backdrop-clear',
            data
        });

        const close = dialogRef.close.bind(dialogRef);
        this.dialogRef.add(close);
        return dialogRef.afterClosed().pipe(tap(() => {
            if (this.dialog.openDialogs.length === 0) {
                this.window.disableInput();
            }
            this.dialogRef.remove(close);
        }));
    }
}