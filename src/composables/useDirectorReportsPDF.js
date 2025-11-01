/**
 * Composable para generar reportes PDF del Director
 * Utiliza jsPDF y jsPDF-AutoTable para crear reportes con los datos filtrados
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import directorReportsService from '@/services/directorReportsService.js'

export const useDirectorReportsPDF = () => {
  /**
   * Configura el estilo base del PDF
   */
  const setupPDFStyles = (doc) => {
    // Configurar fuente
    doc.setFont('helvetica')
    
    // Agregar logo/encabezado
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Portal Vanguardia Juvenil', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Gestión Académica', 105, 28, { align: 'center' })
    
    // Línea separadora
    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)
  }

  /**
   * Genera PDF del Reporte de Rendimiento Académico
   */
  const generateAcademicReport = async (filters) => {
    try {
      const doc = new jsPDF()
      setupPDFStyles(doc)
      
      // Título del reporte
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte de Rendimiento Académico', 105, 50, { align: 'center' })
      
      // Información de filtros
      let yPos = 65
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filters.grado) {
        doc.text(`Grado: ${filters.gradoNombre || filters.grado}`, 20, yPos)
        yPos += 8
      }
      
      if (filters.periodo) {
        const periodos = {
          '1': '1er Trimestre',
          '2': '2do Trimestre', 
          '3': '3er Trimestre'
        }
        doc.text(`Período: ${periodos[filters.periodo]}`, 20, yPos)
        yPos += 8
      }
      
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
      yPos += 15
      
      // Obtener datos del reporte
      const reportData = await directorReportsService.getAcademicReport(filters)
      
      // Estadísticas generales
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Estadísticas Generales', 20, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Promedio General: ${reportData.promedio || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Estudiantes Evaluados: ${reportData.estudiantes || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Total de Cursos: ${reportData.cursos || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Materias Impartidas: ${reportData.materias || 'N/A'}`, 20, yPos)
      yPos += 15
      
      // Tabla de promedios por grado/materia
      if (reportData.detalles && reportData.detalles.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Grado', 'Materia', 'Promedio', 'Estudiantes', 'Maestro']],
          body: reportData.detalles.map(item => [
            item.grado || 'N/A',
            item.materia || 'N/A',
            item.promedio ? item.promedio.toFixed(2) : 'N/A',
            item.estudiantes || 'N/A',
            item.maestro || 'N/A'
          ]),
          theme: 'striped',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: 50
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
        doc.text('Portal Vanguardia Juvenil - Reporte Académico', 20, 290)
      }
      
      // Descargar PDF
      const fileName = `Reporte_Academico_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      return { success: true, fileName }
    } catch (error) {
      console.error('Error generating academic report PDF:', error)
      throw new Error('Error al generar el reporte PDF')
    }
  }

  /**
   * Genera PDF del Reporte de Asistencia
   */
  const generateAttendanceReport = async (filters) => {
    try {
      const doc = new jsPDF()
      setupPDFStyles(doc)
      
      // Título del reporte
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte de Asistencia', 105, 50, { align: 'center' })
      
      // Información de filtros
      let yPos = 65
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filters.grado) {
        doc.text(`Grado: ${filters.gradoNombre || filters.grado}`, 20, yPos)
        yPos += 8
      }
      
      if (filters.periodo) {
        const periodos = {
          '1': '1er Trimestre',
          '2': '2do Trimestre',
          '3': '3er Trimestre'
        }
        doc.text(`Período: ${periodos[filters.periodo]}`, 20, yPos)
        yPos += 8
      }
      
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
      yPos += 15
      
      // Obtener datos del reporte
      const reportData = await directorReportsService.getAttendanceReport(filters)
      
      // Estadísticas generales
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Estadísticas de Asistencia', 20, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Asistencia Promedio: ${reportData.promedio || 'N/A'}%`, 20, yPos)
      yPos += 6
      doc.text(`Días Lectivos: ${reportData.diasClase || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Estudiantes Presentes: ${reportData.estudiantesPresentes || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Estudiantes Ausentes: ${reportData.estudiantesAusentes || 'N/A'}`, 20, yPos)
      yPos += 15
      
      // Tabla de asistencia por grado
      if (reportData.detalles && reportData.detalles.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Grado', 'Total Estudiantes', 'Presentes', 'Ausentes', '% Asistencia']],
          body: reportData.detalles.map(item => [
            item.grado || 'N/A',
            item.totalEstudiantes || 'N/A',
            item.presentes || 'N/A',
            item.ausentes || 'N/A',
            item.porcentaje ? `${item.porcentaje.toFixed(1)}%` : 'N/A'
          ]),
          theme: 'striped',
          headStyles: {
            fillColor: [46, 204, 113],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: 50
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
        doc.text('Portal Vanguardia Juvenil - Reporte de Asistencia', 20, 290)
      }
      
      // Descargar PDF
      const fileName = `Reporte_Asistencia_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      return { success: true, fileName }
    } catch (error) {
      console.error('Error generating attendance report PDF:', error)
      throw new Error('Error al generar el reporte de asistencia PDF')
    }
  }

  /**
   * Genera PDF del Reporte de Planificaciones
   */
  const generatePlanningReport = async (filters) => {
    try {
      const doc = new jsPDF()
      setupPDFStyles(doc)
      
      // Título del reporte
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Estado de Planificaciones', 105, 50, { align: 'center' })
      
      // Información de filtros
      let yPos = 65
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filters.grado) {
        doc.text(`Grado: ${filters.gradoNombre || filters.grado}`, 20, yPos)
        yPos += 8
      }
      
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
      yPos += 15
      
      // Obtener datos del reporte
      const reportData = await directorReportsService.getPlanningReport(filters)
      
      // Estadísticas generales
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Estado General de Planificaciones', 20, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Total de Planificaciones: ${reportData.total || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Completadas: ${reportData.completadas || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`En Progreso: ${reportData.progreso || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Porcentaje de Completitud: ${reportData.porcentaje || 'N/A'}%`, 20, yPos)
      yPos += 15
      
      // Tabla de planificaciones por maestro/materia
      if (reportData.detalles && reportData.detalles.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Maestro', 'Materia', 'Grado', 'Mes', 'Estado', 'Fecha Revisión']],
          body: reportData.detalles.map(item => [
            item.maestro || 'N/A',
            item.materia || 'N/A',
            item.grado || 'N/A',
            item.mes || 'N/A',
            item.estado || 'N/A',
            item.fechaRevision ? new Date(item.fechaRevision).toLocaleDateString('es-ES') : 'Pendiente'
          ]),
          theme: 'striped',
          headStyles: {
            fillColor: [155, 89, 182],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: 50
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
        doc.text('Portal Vanguardia Juvenil - Estado de Planificaciones', 20, 290)
      }
      
      // Descargar PDF
      const fileName = `Estado_Planificaciones_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      return { success: true, fileName }
    } catch (error) {
      console.error('Error generating planning report PDF:', error)
      throw new Error('Error al generar el reporte de planificaciones PDF')
    }
  }

  /**
   * Genera PDF del Reporte Ejecutivo Completo
   */
  const generateExecutiveReport = async (filters) => {
    try {
      const doc = new jsPDF()
      setupPDFStyles(doc)
      
      // Título del reporte
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Ejecutivo Completo', 105, 50, { align: 'center' })
      
      // Información de filtros y fecha
      let yPos = 65
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filters.grado) {
        doc.text(`Grado: ${filters.gradoNombre || filters.grado}`, 20, yPos)
        yPos += 8
      }
      
      if (filters.periodo) {
        const periodos = {
          '1': '1er Trimestre',
          '2': '2do Trimestre',
          '3': '3er Trimestre'
        }
        doc.text(`Período: ${periodos[filters.periodo]}`, 20, yPos)
        yPos += 8
      }
      
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
      yPos += 15
      
      // Obtener todos los datos de reportes
      const [academicData, attendanceData, planningData] = await Promise.all([
        directorReportsService.getAcademicReport(filters),
        directorReportsService.getAttendanceReport(filters),
        directorReportsService.getPlanningReport(filters)
      ])
      
      // Resumen ejecutivo
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen Ejecutivo', 20, yPos)
      yPos += 12
      
      // Sección académica
      doc.setFontSize(12)
      doc.text('Rendimiento Académico', 20, yPos)
      yPos += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`• Promedio General: ${academicData.promedio || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`• Estudiantes Evaluados: ${academicData.estudiantes || 'N/A'}`, 25, yPos)
      yPos += 10
      
      // Sección asistencia  
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Asistencia', 20, yPos)
      yPos += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`• Asistencia Promedio: ${attendanceData.promedio || 'N/A'}%`, 25, yPos)
      yPos += 6
      doc.text(`• Días Lectivos: ${attendanceData.diasClase || 'N/A'}`, 25, yPos)
      yPos += 10
      
      // Sección planificaciones
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Planificaciones', 20, yPos)
      yPos += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`• Total: ${planningData.total || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`• Completadas: ${planningData.completadas || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`• Porcentaje de Completitud: ${planningData.porcentaje || 'N/A'}%`, 25, yPos)
      yPos += 15
      
      // Tabla resumen combinada si hay espacio, si no crear nueva página
      if (yPos > 220) {
        doc.addPage()
        yPos = 30
      }
      
      // Crear tabla resumen combinada
      const summaryData = [
        ['Indicador', 'Valor', 'Estado'],
        ['Promedio Académico', academicData.promedio || 'N/A', academicData.promedio >= 7 ? 'Bueno' : 'Mejorar'],
        ['Asistencia Promedio', `${attendanceData.promedio || 'N/A'}%`, attendanceData.promedio >= 85 ? 'Excelente' : 'Regular'],
        ['Planificaciones Completadas', `${planningData.porcentaje || 'N/A'}%`, planningData.porcentaje >= 80 ? 'En tiempo' : 'Retraso']
      ]
      
      autoTable(doc, {
        startY: yPos,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      })
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
        doc.text('Portal Vanguardia Juvenil - Reporte Ejecutivo', 20, 290)
      }
      
      // Descargar PDF
      const fileName = `Reporte_Ejecutivo_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      return { success: true, fileName }
    } catch (error) {
      console.error('Error generating executive report PDF:', error)
      throw new Error('Error al generar el reporte ejecutivo PDF')
    }
  }

  return {
    generateAcademicReport,
    generateAttendanceReport,
    generatePlanningReport,
    generateExecutiveReport
  }
}