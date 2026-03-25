import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  user: string;
  initials: string;
  text: string;
  timestamp: string;
  vinRef?: string;
}

@Component({
    selector: 'kf-chat-page',
    imports: [FormsModule],
    template: `
    <div class="p-6 space-y-5">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Chat</h1>
        <p class="text-sm text-slate-500 mt-0.5">Panel de mensajes y menciones del equipo</p>
      </div>
      <div class="kf-card flex flex-col h-[calc(100vh-220px)]">
        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          @for (msg of messages(); track msg) {
            <div class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {{ msg.initials }}
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-semibold text-slate-800">{{ msg.user }}</span>
                  <span class="text-xs text-slate-400">{{ msg.timestamp }}</span>
                  @if (msg.vinRef) {
                    <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">{{ msg.vinRef }}</span>
                  }
                </div>
                <p class="text-sm text-slate-600 mt-0.5">{{ msg.text }}</p>
              </div>
            </div>
          }
        </div>
        <!-- Input -->
        <div class="border-t border-slate-200 p-4 flex gap-3">
          <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"
            placeholder="Escribe un mensaje… (@usuario para mencionar)"
            class="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          <button (click)="sendMessage()" [disabled]="!newMessage.trim()"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Enviar
          </button>
        </div>
      </div>
    </div>
    `
})
export class ChatPageComponent {
  messages = signal<ChatMessage[]>([
    { id: '1', user: 'Juan Pérez', initials: 'JP', text: 'El VIN WDB9988776655AABC1 sigue demorado en PDI, ¿hay novedades del carrocero?', timestamp: 'Hoy 09:15', vinRef: 'WDB9988776655AABC1' },
    { id: '2', user: 'Maria Lopez', initials: 'ML', text: '@Juan Pérez El carrocero informa que finalizarían el viernes. Actualicé la fecha en el sistema.', timestamp: 'Hoy 09:32' },
    { id: '3', user: 'Carlos Ruiz', initials: 'CR', text: 'La excavadora CAT330 está con 5 días de atraso. Necesitamos escalar a logística.', timestamp: 'Hoy 10:05', vinRef: 'CATEXC330GC2025MAQ1' },
    { id: '4', user: 'Ana Torres', initials: 'AT', text: '@Carlos Ruiz Enviado correo a logística. Respuesta esperada antes del mediodía.', timestamp: 'Hoy 10:22' },
  ]);

  newMessage = '';

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.messages.update(msgs => [...msgs, {
      id: Date.now().toString(),
      user: 'Juan Pérez',
      initials: 'JP',
      text: this.newMessage,
      timestamp: 'Ahora',
    }]);
    this.newMessage = '';
  }
}
