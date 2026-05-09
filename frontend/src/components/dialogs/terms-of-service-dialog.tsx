"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollableDialog } from "@/components/dialogs/scrollable-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TermsOfServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfServiceDialog({ open, onOpenChange }: TermsOfServiceDialogProps) {
  // Simula a busca do texto dos termos em uma API
  const { data, isLoading } = useQuery({
    queryKey: ["terms-of-service"],
    queryFn: async () => {
      // Simulando um delay de rede de 1.5 segundos para vermos o Skeleton
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        content: `Bem-vindo aos Termos de Serviço da nossa plataforma.

1. Aceitação dos Termos
Ao acessar e usar este software, você concorda em cumprir e ficar vinculado a estes termos. Se você não concorda com alguma parte destes termos, você não tem permissão para acessar o serviço.

2. Uso do Serviço
Nossa plataforma fornece ferramentas de gerenciamento de dados SaaS. Você concorda em usar o serviço apenas para fins legais e de acordo com as leis locais e internacionais.

3. Contas de Usuário
Para acessar certos recursos, você deve registrar uma conta. Você é responsável por manter a confidencialidade das credenciais de sua conta e por todas as atividades que ocorrem sob ela.

4. Privacidade e Proteção de Dados
Sua privacidade é importante para nós. Nossa Política de Privacidade explica como coletamos, usamos e protegemos seus dados pessoais.

5. Limitação de Responsabilidade
Em nenhum caso a empresa será responsável por quaisquer danos indiretos, incidentais, especiais ou punitivos decorrentes de ou relacionados ao uso de nossos serviços.

6. Alterações nos Termos
Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Avisaremos com antecedência sobre quaisquer mudanças significativas.

Obrigado por utilizar nossos serviços!`,
      };
    },
    enabled: open, // Só faz o fetch quando o modal for aberto!
  });

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Termos de Serviço"
      description="Por favor, leia atentamente as nossas políticas."
      className="sm:max-w-[700px]"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={isLoading} onClick={() => onOpenChange(false)}>
            Entendi e Aceito
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[98%]" />
          <Skeleton className="h-4 w-[85%] mt-6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
          {data?.content || "Nenhum termo encontrado."}
        </div>
      )}
    </ScrollableDialog>
  );
}
