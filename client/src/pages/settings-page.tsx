import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
import { 
  Bell, 
  Shield, 
  Mail, 
  Key, 
  Database, 
  CloudUpload, 
  CloudDownload,
  Save,
  Moon,
  Sun 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/theme-provider";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    darkMode,
    animations,
    compactMode,
    highContrast,
    updateThemeSetting
  } = useTheme();
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiration: true,
    logFailedAttempts: true,
    blockAfterFailedAttempts: true,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    systemUpdates: false,
    weeklyReports: false,
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    animations: true,
    compactMode: false,
    highContrast: false,
  });
  
  const [dataSettings, setDataSettings] = useState({
    dataBackup: true,
    autoBackup: false,
    dataPurgeOld: true,
    anonymizeData: false,
  });

  // Sincronizar com as configurações de tema do contexto global
  useEffect(() => {
    setDisplaySettings({
      darkMode,
      animations,
      compactMode,
      highContrast
    });
  }, [darkMode, animations, compactMode, highContrast]);

  const handleSecurityChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Configuração de segurança atualizada",
      description: `${setting} foi ${value ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Configuração de notificação atualizada",
      description: `${setting} foi ${value ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleDisplayChange = (setting: string, value: boolean) => {
    // Atualizar tanto o estado local quanto o contexto global de tema
    setDisplaySettings(prev => ({ ...prev, [setting]: value }));
    updateThemeSetting(setting, value);
    
    toast({
      title: "Configuração de exibição atualizada",
      description: `${setting} foi ${value ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleDataChange = (setting: string, value: boolean) => {
    setDataSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Configuração de dados atualizada",
      description: `${setting} foi ${value ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleImportData = () => {
    toast({
      title: "Importação de dados",
      description: "Funcionalidade de importação de dados em desenvolvimento.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação de dados",
      description: "Funcionalidade de exportação de dados em desenvolvimento.",
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup realizado",
      description: "Backup manual foi iniciado com sucesso.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Todas as alterações foram salvas com sucesso.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <motion.div
            className="page-transition"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
              <p className="text-gray-600">Personalize as configurações do sistema</p>
            </div>

            <Tabs defaultValue="security" className="space-y-6">
              <TabsList className="mb-6">
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="display">Interface</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>

              {/* Security Settings */}
              <TabsContent value="security">
                <motion.div variants={itemVariants}>
                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Configurações de Segurança</h2>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="twoFactorAuth" className="text-base font-medium">Autenticação de dois fatores</Label>
                            <p className="text-sm text-gray-500">Exigir verificação adicional ao fazer login</p>
                          </div>
                          <Switch
                            id="twoFactorAuth"
                            checked={securitySettings.twoFactorAuth}
                            onCheckedChange={(value) => handleSecurityChange('twoFactorAuth', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="passwordExpiration" className="text-base font-medium">Expiração de senha</Label>
                            <p className="text-sm text-gray-500">Exigir alteração de senha a cada 90 dias</p>
                          </div>
                          <Switch
                            id="passwordExpiration"
                            checked={securitySettings.passwordExpiration}
                            onCheckedChange={(value) => handleSecurityChange('passwordExpiration', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="logFailedAttempts" className="text-base font-medium">Registrar tentativas de login</Label>
                            <p className="text-sm text-gray-500">Registrar todas as tentativas falhas de login</p>
                          </div>
                          <Switch
                            id="logFailedAttempts"
                            checked={securitySettings.logFailedAttempts}
                            onCheckedChange={(value) => handleSecurityChange('logFailedAttempts', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="blockAfterFailedAttempts" className="text-base font-medium">Bloqueio automático</Label>
                            <p className="text-sm text-gray-500">Bloquear conta após 5 tentativas falhas de login</p>
                          </div>
                          <Switch
                            id="blockAfterFailedAttempts"
                            checked={securitySettings.blockAfterFailedAttempts}
                            onCheckedChange={(value) => handleSecurityChange('blockAfterFailedAttempts', value)}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button onClick={handleSaveSettings}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </motion.div>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <motion.div variants={itemVariants}>
                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Configurações de Notificações</h2>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailNotifications" className="text-base font-medium">Notificações por e-mail</Label>
                            <p className="text-sm text-gray-500">Receba notificações importantes por e-mail</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="loginAlerts" className="text-base font-medium">Alertas de login</Label>
                            <p className="text-sm text-gray-500">Receba alertas quando sua conta for acessada</p>
                          </div>
                          <Switch
                            id="loginAlerts"
                            checked={notificationSettings.loginAlerts}
                            onCheckedChange={(value) => handleNotificationChange('loginAlerts', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="systemUpdates" className="text-base font-medium">Atualizações do sistema</Label>
                            <p className="text-sm text-gray-500">Receba notificações sobre atualizações do sistema</p>
                          </div>
                          <Switch
                            id="systemUpdates"
                            checked={notificationSettings.systemUpdates}
                            onCheckedChange={(value) => handleNotificationChange('systemUpdates', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weeklyReports" className="text-base font-medium">Relatórios semanais</Label>
                            <p className="text-sm text-gray-500">Receba um resumo semanal das atividades</p>
                          </div>
                          <Switch
                            id="weeklyReports"
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(value) => handleNotificationChange('weeklyReports', value)}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button onClick={handleSaveSettings}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </motion.div>
              </TabsContent>

              {/* Display Settings */}
              <TabsContent value="display">
                <motion.div variants={itemVariants}>
                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Configurações de Interface</h2>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="darkMode" className="text-base font-medium">Modo escuro</Label>
                            <p className="text-sm text-gray-500">Ativar tema escuro para a interface</p>
                          </div>
                          <Switch
                            id="darkMode"
                            checked={displaySettings.darkMode}
                            onCheckedChange={(value) => handleDisplayChange('darkMode', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="animations" className="text-base font-medium">Animações</Label>
                            <p className="text-sm text-gray-500">Ativar animações e efeitos visuais</p>
                          </div>
                          <Switch
                            id="animations"
                            checked={displaySettings.animations}
                            onCheckedChange={(value) => handleDisplayChange('animations', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="compactMode" className="text-base font-medium">Modo compacto</Label>
                            <p className="text-sm text-gray-500">Reduzir espaçamento entre elementos</p>
                          </div>
                          <Switch
                            id="compactMode"
                            checked={displaySettings.compactMode}
                            onCheckedChange={(value) => handleDisplayChange('compactMode', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="highContrast" className="text-base font-medium">Alto contraste</Label>
                            <p className="text-sm text-gray-500">Aumentar o contraste para melhor acessibilidade</p>
                          </div>
                          <Switch
                            id="highContrast"
                            checked={displaySettings.highContrast}
                            onCheckedChange={(value) => handleDisplayChange('highContrast', value)}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button onClick={handleSaveSettings}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </motion.div>
              </TabsContent>

              {/* Data Settings */}
              <TabsContent value="data">
                <motion.div variants={itemVariants} className="space-y-6">
                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Configurações de Dados</h2>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="dataBackup" className="text-base font-medium">Backup de dados</Label>
                            <p className="text-sm text-gray-500">Habilitar backup de dados do sistema</p>
                          </div>
                          <Switch
                            id="dataBackup"
                            checked={dataSettings.dataBackup}
                            onCheckedChange={(value) => handleDataChange('dataBackup', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoBackup" className="text-base font-medium">Backup automático</Label>
                            <p className="text-sm text-gray-500">Realizar backup automático diariamente</p>
                          </div>
                          <Switch
                            id="autoBackup"
                            checked={dataSettings.autoBackup}
                            onCheckedChange={(value) => handleDataChange('autoBackup', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="dataPurgeOld" className="text-base font-medium">Limpar dados antigos</Label>
                            <p className="text-sm text-gray-500">Remover registros de atividades após 90 dias</p>
                          </div>
                          <Switch
                            id="dataPurgeOld"
                            checked={dataSettings.dataPurgeOld}
                            onCheckedChange={(value) => handleDataChange('dataPurgeOld', value)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="anonymizeData" className="text-base font-medium">Anonimizar dados</Label>
                            <p className="text-sm text-gray-500">Anonimizar dados sensíveis em relatórios</p>
                          </div>
                          <Switch
                            id="anonymizeData"
                            checked={dataSettings.anonymizeData}
                            onCheckedChange={(value) => handleDataChange('anonymizeData', value)}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={handleBackupNow}>
                            Fazer Backup Agora
                          </Button>
                          <Button onClick={handleSaveSettings}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>

                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <CloudUpload className="h-5 w-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Importação e Exportação</h2>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Importe ou exporte dados do sistema para backup ou transferência.
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                          <Button variant="outline" className="flex-1" onClick={handleImportData}>
                            <CloudUpload className="h-4 w-4 mr-2" />
                            Importar Dados
                          </Button>
                          
                          <Button variant="outline" className="flex-1" onClick={handleExportData}>
                            <CloudDownload className="h-4 w-4 mr-2" />
                            Exportar Dados
                          </Button>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
