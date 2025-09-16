import React, { useState, useRef } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import Dropzone from 'react-dropzone';
import axios from 'axios';

const steps = ['Код', 'Занятость', 'Документы', 'Заявление', 'Подпись', 'Итог'];

const HireWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [sigPad, setSigPad] = useState(null);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      employmentType: '',
      passportNumber: 'A01015545',
      passportExpiry: '1990-01-01', // Тестовая дата рождения
      fio: 'Иван Иванов Иванович',
      hireDate: '',
      workplace: '',
      position: '',
      rate: '',
      salary: ''
    }
  });

  // Mock проверки кода
  const validateCode = (code) => code === '12345' ? { status: 'success', message: 'Добро пожаловать в ООО «Автофин»!' } : { status: 'error', message: 'Неверный код' };

  // Проверка документов
  const validateDoc = (data) => {
    if (!/^A\d{7,8}$/.test(data.passportNumber)) return { status: 'error', message: 'Неверный формат номера паспорта (A + цифры)' };
    if (data.fio.length < 5) return { status: 'error', message: 'ФИО слишком короткое' };
    return { status: 'success', message: 'Данные приняты' };
  };

  const handleFileDrop = (files) => {
    const file = files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      // Автоматически заполняем тестовые данные при загрузке любого фото
      setValue('fio', 'Иван Иванов Иванович');
      setValue('passportNumber', 'A01015545');
      setValue('passportExpiry', '1990-01-01'); // Тестовая дата рождения
      alert('Тестовые данные заполнены: ФИО - Иван Иванов Иванович, Паспорт - A01015545, Дата рождения - 01.01.1990');
    }
  };

  const onSubmit = async (data) => {
    if (activeStep === 0) {
      if (errors.code) return; // Проверка валидации
      const result = validateCode(data.code);
      alert(result.message);
      if (result.status === 'success') setActiveStep(1);
    } else if (activeStep === 1) {
      if (errors.employmentType) return; // Проверка валидации
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (errors.fio || errors.passportNumber || errors.passportExpiry) return; // Проверка валидации
      const result = validateDoc(data);
      alert(result.message);
      if (result.status === 'success') setActiveStep(3);
    } else if (activeStep === 3) {
      if (errors.hireDate || errors.workplace || errors.position || errors.rate || errors.salary) return; // Проверка валидации
      setActiveStep(4);
    } else if (activeStep === 4) {
      if (!sigPad.isEmpty()) {
        setActiveStep(5);
        // Отправка данных на сервер для генерации и скачивания .docx файлов
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        try {
          const response = await axios.post('https://4369273ea1d4.ngrok-free.app/generate-docs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob' // Ожидаем бинарные данные (ZIP)
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'documents.zip');
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          alert('Документы скачаны: documents.zip (содержит Образец приёма на работу.docx и Трудовой контракт.docx)');
        } catch (error) {
          console.error('Ошибка при генерации документов:', error);
          alert('Ошибка при генерации документов. Убедитесь, что сервер запущен.');
        }
      } else {
        alert('Подпишите заявление');
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const clearSignature = () => sigPad.clear();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>Принять на работу</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <form onSubmit={handleSubmit(onSubmit)}>
        {activeStep === 0 && (
          <Box>
            <Controller
              name="code"
              control={control}
              rules={{ required: 'Код обязателен' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Введите уникальный код"
                  fullWidth
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                />
              )}
            />
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <Controller
              name="employmentType"
              control={control}
              rules={{ required: 'Вид занятости обязателен' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.employmentType}>
                  <InputLabel>Вид занятости</InputLabel>
                  <Select {...field}>
                    <MenuItem value="main">Основное место работы</MenuItem>
                    <MenuItem value="part-time">По совместительству</MenuItem>
                  </Select>
                  {errors.employmentType && <Typography color="error">{errors.employmentType.message}</Typography>}
                </FormControl>
              )}
            />
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Загрузите личную сторону паспорта (для тестовых данных)</Typography>
            <Dropzone onDrop={handleFileDrop} accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}>
              {({ getRootProps, getInputProps }) => (
                <Box {...getRootProps()} sx={{ border: '1px dashed grey', p: 2, mb: 2, textAlign: 'center' }}>
                  <input {...getInputProps()} capture="environment" />
                  <Typography>Перетащите фото паспорта или кликните (тестовые данные заполнятся автоматически)</Typography>
                </Box>
              )}
            </Dropzone>
            {preview && <img src={preview} alt="Паспорт" style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }} />}
            <Controller
              name="fio"
              control={control}
              rules={{ required: 'ФИО обязательно' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ФИО (Насаб Ном Номи падар)"
                  fullWidth
                  margin="normal"
                  disabled
                  error={!!errors.fio}
                  helperText={errors.fio?.message}
                />
              )}
            />
            <Controller
              name="passportNumber"
              control={control}
              rules={{ required: 'Номер паспорта обязателен' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Номер паспорта (A + цифры)"
                  fullWidth
                  margin="normal"
                  disabled
                  error={!!errors.passportNumber}
                  helperText={errors.passportNumber?.message}
                />
              )}
            />
            <Controller
              name="passportExpiry"
              control={control}
              rules={{ required: 'Дата рождения обязательна' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Дата рождения (ДД.ММ.ГГГГ)"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  disabled
                  error={!!errors.passportExpiry}
                  helperText={errors.passportExpiry?.message}
                />
              )}
            />
            <Button onClick={() => { setPreview(null); setValue('fio', 'Иван Иванов Иванович'); setValue('passportNumber', 'A01015545'); setValue('passportExpiry', '1990-01-01'); }} sx={{ mt: 1 }}>Очистить и восстановить тестовые данные</Button>
          </Box>
        )}
        {activeStep === 3 && (
          <Box>
            <Controller
              name="fio"
              control={control}
              rules={{ required: 'ФИО обязательно' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ФИО"
                  fullWidth
                  margin="normal"
                  disabled
                  error={!!errors.fio}
                  helperText={errors.fio?.message}
                />
              )}
            />
            <Controller
              name="hireDate"
              control={control}
              rules={{ required: 'Дата приема обязательна' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Дата приема"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.hireDate}
                  helperText={errors.hireDate?.message}
                />
              )}
            />
            <Controller
              name="workplace"
              control={control}
              rules={{ required: 'Место работы обязательно' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Место работы"
                  fullWidth
                  margin="normal"
                  error={!!errors.workplace}
                  helperText={errors.workplace?.message}
                />
              )}
            />
            <Controller
              name="position"
              control={control}
              rules={{ required: 'Должность обязательна' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Должность"
                  fullWidth
                  margin="normal"
                  error={!!errors.position}
                  helperText={errors.position?.message}
                />
              )}
            />
            <Controller
              name="rate"
              control={control}
              rules={{ required: 'Ставка обязательна' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.rate}>
                  <InputLabel>Ставка</InputLabel>
                  <Select {...field}>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="0.5">0.5</MenuItem>
                  </Select>
                  {errors.rate && <Typography color="error">{errors.rate.message}</Typography>}
                </FormControl>
              )}
            />
            <Controller
              name="salary"
              control={control}
              rules={{ required: 'Зарплата обязательна' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Зарплата (общая с налогами, за месяц)"
                  fullWidth
                  margin="normal"
                  error={!!errors.salary}
                  helperText={errors.salary?.message}
                />
              )}
            />
            <Typography variant="caption">Пример: Если зарплата 2000 сомони с налогами, введите в это поле.</Typography>
          </Box>
        )}
        {activeStep === 4 && (
          <Box>
            <Typography>Подпишите заявление:</Typography>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 500, height: 200, className: 'sigCanvas', style: { border: '1px solid black' } }}
              ref={(ref) => setSigPad(ref)}
            />
            <Button onClick={clearSignature} sx={{ mt: 1 }}>Очистить</Button>
          </Box>
        )}
        {activeStep === 5 && (
          <Box>
            <Typography>Заявление отправлено! Документы скачаны.</Typography>
            <Typography variant="caption">Приказ и контракт доступны в файле documents.zip.</Typography>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Назад</Button>
          <Button type="submit" variant="contained">
            {activeStep === steps.length - 1 ? 'Завершить' : 'Далее'}
          </Button>
        </Box>
      </form>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default HireWizard;