import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export const MessengerBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aquí integrarías con tu sistema de mensajería
      console.log('Mensaje enviado:', message);
      setMessage('');
      // Opcional: cerrar el chat después de enviar
      // setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-80 h-96 mb-4 shadow-glow animate-in slide-in-from-bottom-2">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>💬 Soporte ZY Solutions</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full p-4">
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="bg-muted p-3 rounded-lg mb-2">
                <p className="text-sm">
                  ¡Hola! 👋 Soy el asistente de ZY Solutions. ¿En qué puedo ayudarte con tu campaña de email marketing?
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <Button 
                onClick={handleSendMessage}
                className="w-full"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="rounded-full w-14 h-14 shadow-glow animate-pulse-glow transition-smooth"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};