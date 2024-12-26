import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  ButtonGroup,
  Tooltip,
  Container,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WhatsApp as WhatsAppIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { taxasParcelas } from '../types/rates';
import { Logo } from './Logo';
import jsPDF from 'jspdf';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const Simulator = () => {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const calculateInstallment = (installments: number) => {
    const amount = parseFloat(loanAmount.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const rate = taxasParcelas[installments] / 100;
    const totalAmount = amount * (1 + rate);
    const monthlyPayment = totalAmount / installments;
    
    return {
      monthlyPayment,
      totalAmount,
      interestAmount: totalAmount - amount,
      rate: rate * 100
    };
  };

  const handleWhatsAppClick = () => {
    setPhoneNumber('');
    setPhoneError('');
    setWhatsappDialog(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });
    
    const amount = parseFloat(loanAmount.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    
    // Configurações iniciais
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    // Cores
    const primaryColor = [15, 23, 42] as const;  // #0F172A
    const secondaryColor = [59, 130, 246] as const;  // #3B82F6
    const textColor = [71, 85, 105] as const;  // #475569
    
    // Cabeçalho
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('SIMULAÇÃO ALFA PRIME', pageWidth / 2, 20, { align: 'center' });
    
    // Data da simulação
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth - margin, 10, { align: 'right' });
    
    // Valor solicitado
    const boxY = 40;
    doc.setFillColor(248, 250, 252);  // #F8FAFC
    doc.roundedRect(margin, boxY, contentWidth, 25, 2, 2, 'F');
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(margin, boxY, 3, 25, 'F');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Valor da Simulação', margin + 10, boxY + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(formatCurrency(amount), margin + 10, boxY + 20);
    
    // Tabela de opções
    const tableY = 75;
    const headerHeight = 12;
    const rowHeight = 8;
    const colWidths = {
      parcelas: 40,
      valor: 65,
      total: 65,
    };
    
    // Cabeçalho da tabela
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, tableY, contentWidth, headerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let currentX = margin + 5;
    doc.text('Parcelas', currentX, tableY + 8);
    currentX += colWidths.parcelas + 10;
    
    doc.text('Valor Mensal', currentX, tableY + 8);
    currentX += colWidths.valor + 10;
    
    doc.text('Total', currentX, tableY + 8);
    
    // Linhas da tabela
    let currentY = tableY + headerHeight;
    
    Object.entries(taxasParcelas).forEach(([installment, rate], index) => {
      const results = calculateInstallment(Number(installment));
      
      // Fundo alternado
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }
      
      // Conteúdo da linha
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      currentX = margin + 5;
      doc.setFontSize(8);
      doc.text(`${installment}x`, currentX, currentY + 5.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      currentX += colWidths.parcelas + 10;
      doc.text(formatCurrency(results.monthlyPayment), currentX, currentY + 5.5);
      
      currentX += colWidths.valor + 10;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(formatCurrency(results.totalAmount), currentX, currentY + 5.5);
      
      currentY += rowHeight;
    });
    
    // Rodapé
    const footerY = pageHeight - 15;
    
    // Linha separadora
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    // Texto do rodapé
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    doc.text(
      'Alfa Prime - Soluções financeiras personalizadas para você',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    return doc;
  };

  const handleWhatsAppShare = () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Por favor, insira um número de telefone');
      return;
    }

    // Remove todos os caracteres não numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Verifica se o número tem pelo menos 10 dígitos (DDD + número)
    if (cleanNumber.length < 10) {
      setPhoneError('Número de telefone inválido');
      return;
    }

    // Gera o PDF
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    
    // Cria um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', pdfBlob, 'simulacao_alfa_prime.pdf');
    
    // Formata o número para o padrão internacional
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    // Abre o WhatsApp com a mensagem e o arquivo
    const message = encodeURIComponent('Segue a simulação Alfa Prime 💰');
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
    
    // Cria um link temporário para download do PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simulacao_alfa_prime.pdf';
    link.click();
    URL.revokeObjectURL(url);
    
    setWhatsappDialog(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError('');
  };

  const handleCopy = async () => {
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simulacao_alfa_prime.pdf';
    link.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const amount = parseFloat(loanAmount.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Logo />
            </motion.div>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                mt: 3,
                fontWeight: 500,
              }}
            >
              Soluções financeiras personalizadas para você
            </Typography>
          </Box>
          
          <Card 
            sx={{ 
              mb: 4,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Valor da Simulação"
                    value={loanAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formattedValue = value ? formatCurrency(Number(value) / 100) : '';
                      setLoanAmount(formattedValue);
                      setSelectedInstallment(null);
                    }}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.25rem',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <AnimatePresence>
            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <CalculateIcon /> Opções de Parcelamento
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Escolha a melhor opção para você
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {Object.entries(taxasParcelas).map(([installment, rate]) => {
                    const results = calculateInstallment(Number(installment));
                    const isSelected = selectedInstallment === Number(installment);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={installment}>
                        <Paper
                          component={motion.div}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          sx={{
                            p: 3,
                            cursor: 'pointer',
                            height: '100%',
                            bgcolor: isSelected ? 'primary.main' : 'background.paper',
                            color: isSelected ? 'white' : 'text.primary',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.dark' : 'grey.50',
                            },
                            '&::before': isSelected ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                            } : {},
                          }}
                          onClick={() => setSelectedInstallment(Number(installment))}
                        >
                          <Typography variant="h5" gutterBottom fontWeight="bold">
                            {installment}x de {formatCurrency(results.monthlyPayment)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                              mb: 1,
                            }}
                          >
                            Taxa de juros: {rate.toFixed(2)}%
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mt: 'auto',
                              pt: 1,
                              borderTop: 1,
                              borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'divider',
                            }}
                          >
                            Total: {formatCurrency(results.totalAmount)}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginTop: '3rem' }}
                >
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                      Compartilhar Simulação
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <ButtonGroup variant="contained" size="large">
                          <Tooltip title="WhatsApp">
                            <Button
                              onClick={handleWhatsAppClick}
                              startIcon={<WhatsAppIcon />}
                              sx={{ 
                                bgcolor: '#25D366', 
                                '&:hover': { 
                                  bgcolor: '#128C7E',
                                },
                              }}
                            >
                              WhatsApp
                            </Button>
                          </Tooltip>
                        </ButtonGroup>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Baixar PDF">
                          <Button
                            onClick={handleCopy}
                            startIcon={<PdfIcon />}
                            variant="contained"
                            color="secondary"
                          >
                            {copied ? "PDF Gerado!" : "Gerar PDF"}
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>

      <Dialog 
        open={whatsappDialog} 
        onClose={() => setWhatsappDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsAppIcon sx={{ color: '#25D366' }} />
            <Typography variant="h6">
              Compartilhar via WhatsApp
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setWhatsappDialog(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Número do WhatsApp"
            placeholder="(00) 00000-0000"
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={!!phoneError}
            helperText={phoneError || 'Insira o número com DDD'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setWhatsappDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            variant="contained"
            sx={{ 
              bgcolor: '#25D366',
              '&:hover': {
                bgcolor: '#128C7E',
              },
            }}
            startIcon={<WhatsAppIcon />}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 