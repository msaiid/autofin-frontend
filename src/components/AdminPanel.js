import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, Drawer, List, ListItemButton, ListItemText, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Select, MenuItem, FormControl, InputLabel, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Dropzone from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';

// Mock data for demonstration
const mockEmployees = [
  { id: 1, name: 'Иван Иванов', position: 'Менеджер', status: 'Активен' },
  { id: 2, name: 'Петр Петров', position: 'Бухгалтер', status: 'В отпуске' },
];

const mockCalendar = 'Календарь на 2025 год: праздники, рабочие дни и т.д.';

const AdminPanel = () => {
  const [openSections, setOpenSections] = useState({
    general: false,
    cadres: false,
    salary: false,
    reports: false,
  });

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubSection, setSelectedSubSection] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sigPad, setSigPad] = useState(null);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubSectionClick = (section, subSection) => {
    setSelectedSection(section);
    setSelectedSubSection(subSection);
  };

  const handleFileDrop = (files) => {
    const file = files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearSignature = () => sigPad.clear();

  const sections = [
    {
      title: 'Общие и настройки',
      key: 'general',
      subSections: [
        'Ввод остатков',
        'Компания',
        'Показатели для расчетов',
        'Рабочий календарь',
        'График работы',
        'Импорт данных о табеле',
        'Экспорт данных в 1С',
      ],
    },
    {
      title: 'Кадры',
      key: 'cadres',
      subSections: [
        'Прием на работу',
        'Перемещения',
        'Увольнения',
      ],
    },
    {
      title: 'Заработная плата',
      key: 'salary',
      subSections: [
        'Отсутствия',
        'Отпускные',
        'Больничные',
        'Командировки',
        'Премии и бонусы',
        'Удержания от зп',
        'Начисления и удержания налогов',
        'Ведомости к оплате',
      ],
    },
    {
      title: 'Отчеты',
      key: 'reports',
      subSections: [
        'Расчетные ведомости',
        'Расчетные листки',
        'Отчеты в Статистику',
        'Отчеты ФСЗН',
        'Список сотрудников',
      ],
    },
  ];

  const renderContent = () => {
    if (selectedSubSection === 'Прием на работу') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Прием на работу</Typography>
          <Dropzone onDrop={handleFileDrop} accept={{ 'image/*': ['.jpg', '.png', '.pdf'] }}>
            {({ getRootProps, getInputProps }) => (
              <Box {...getRootProps()} sx={{ border: '1px dashed grey', p: 2, mb: 2 }}>
                <input {...getInputProps()} />
                <Typography>Загрузите документы (паспорт, диплом и т.д.)</Typography>
              </Box>
            )}
          </Dropzone>
          {preview && <img src={preview} alt="Документ" style={{ maxWidth: '100%', maxHeight: 200 }} />}
          <FormControl fullWidth margin="normal">
            <InputLabel>Вид занятости</InputLabel>
            <Select>
              <MenuItem value="main">Основное место работы</MenuItem>
              <MenuItem value="part-time">По совместительству</MenuItem>
            </Select>
          </FormControl>
          <TextField label="ФИО" fullWidth margin="normal" disabled />
          <TextField label="Дата принятия" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Место работы</InputLabel>
            <Select>
              <MenuItem value="office">Офис</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Должность</InputLabel>
            <Select>
              <MenuItem value="manager">Менеджер</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Количество ставок</InputLabel>
            <Select>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="0.5">0.5</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Зарплата" fullWidth margin="normal" />
          <Typography variant="h6" gutterBottom>Подпись</Typography>
          <SignatureCanvas
            penColor="black"
            canvasProps={{ width: 500, height: 200, style: { border: '1px solid black' } }}
            ref={(ref) => setSigPad(ref)}
          />
          <Button onClick={clearSignature} sx={{ mt: 1 }}>Очистить</Button>
          <Button variant="contained" sx={{ mt: 2 }}>Одобрить и сгенерировать документы</Button>
        </Box>
      );
    } else if (selectedSubSection === 'Больничные') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Больничные</Typography>
          <Dropzone onDrop={handleFileDrop} accept={{ 'image/*': ['.jpg', '.png', '.pdf'] }}>
            {({ getRootProps, getInputProps }) => (
              <Box {...getRootProps()} sx={{ border: '1px dashed grey', p: 2, mb: 2 }}>
                <input {...getInputProps()} />
                <Typography>Загрузите больничный листок</Typography>
              </Box>
            )}
          </Dropzone>
          <Button variant="contained" sx={{ mt: 2 }}>Одобрить</Button>
        </Box>
      );
    } else if (selectedSubSection === 'Командировки') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Командировки</Typography>
          <TextField
            label="Заявка на командировку"
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Button variant="contained" sx={{ mt: 2 }}>
            Одобрить и создать приказ
          </Button>
        </Box>
      );
    } else if (selectedSubSection === 'Список сотрудников') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Список сотрудников</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>ФИО</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="contained" sx={{ mt: 2 }}>Экспорт в 1С</Button>
        </Box>
      );
    } else if (selectedSubSection === 'Рабочий календарь') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Рабочий календарь</Typography>
          <Typography>{mockCalendar}</Typography>
          <Switch /> <Typography component="span">Редактировать календарь</Typography>
        </Box>
      );
    } // Добавьте аналогичные блоки для других подразделов

    return <Typography>Выберите подраздел</Typography>;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6">Админ-интерфейс Автофин</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {sections.map((section) => (
            <React.Fragment key={section.key}>
              <ListItemButton onClick={() => toggleSection(section.key)}>
                <ListItemText primary={section.title} />
                {openSections[section.key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={openSections[section.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.subSections.map((sub) => (
                    <ListItemButton key={sub} sx={{ pl: 4 }} onClick={() => handleSubSectionClick(section.title, sub)}>
                      <ListItemText primary={sub} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminPanel;