// دالة لقراءة الملف وتحميل محتواه في مربع النص
function loadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('يرجى اختيار ملف!');
        return;
    }

    if (file.name.endsWith('.pdf')) {
        // استخدام PDF.js لتحويل PDF إلى نص
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedArray = new Uint8Array(reader.result);
            pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
                pdf.getPage(1).then(function(page) {
                    page.getTextContent().then(function(textContent) {
                        let text = '';
                        textContent.items.forEach(function(item) {
                            text += item.str + ' ';
                        });
                        document.getElementById('fileContent').value = text;
                    });
                });
            });
        };
        reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.docx')) {
        // استخدام Mammoth.js لتحويل DOCX إلى نص
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = reader.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then(function(result) {
                    document.getElementById('fileContent').value = result.value;
                })
                .catch(function(err) {
                    console.log(err.message);
                });
        };
        reader.readAsArrayBuffer(file);
    } else {
        // التعامل مع ملفات TXT
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            document.getElementById('fileContent').value = content;
        };
        reader.readAsText(file, 'utf-8'); // تأكد من استخدام UTF-8
    }
}

// دالة لتوليد الأسئلة بناءً على نوع السؤال وعدد الأسئلة
function generateQuestions() {
    const content = document.getElementById('fileContent').value;
    const questionType = document.getElementById('questionType').value;
    const questionCount = parseInt(document.getElementById('questionCount').value);

    if (!content) {
        alert('يرجى تحميل ملف أولا!');
        return;
    }

    let questions = [];

    // توليد الأسئلة بناءً على النوع المختار
    switch (questionType) {
        case 'definition':
            questions = generateDefinitionQuestions(content, questionCount);
            break;
        case 'fill':
            questions = generateFillInTheBlankQuestions(content, questionCount);
            break;
        case 'truefalse':
            questions = generateTrueFalseQuestions(content, questionCount);
            break;
        case 'essay':
            questions = generateEssayQuestions(content, questionCount);
            break;
        case 'multiplechoice':
            questions = generateMultipleChoiceQuestions(content, questionCount);
            break;
        case 'numerical':
            questions = generateNumericalQuestions(questionCount);
            break;
        default:
            break;
    }

    // عرض الأسئلة في مربع النص
    document.getElementById('generatedQuestions').value = questions.join('\n\n');
}

// دوال توليد أنواع الأسئلة المختلفة

function generateDefinitionQuestions(content, count) {
    const words = content.split(' ').slice(0, count);
    return words.map(word => `عرف المصطلح التالي: ${word}`);
}

function generateFillInTheBlankQuestions(content, count) {
    const sentences = content.split('.').slice(0, count);
    return sentences.map(sentence => sentence.replace(/(\w+)/, '____'));
}

function generateTrueFalseQuestions(content, count) {
    const sentences = content.split('.').slice(0, count);
    return sentences.map(sentence => `صح أم خطأ: ${sentence}`);
}

function generateEssayQuestions(content, count) {
    const topics = content.split(' ').slice(0, count);
    return topics.map(topic => `اكتب مقال عن: ${topic}`);
}

function generateMultipleChoiceQuestions(content, count) {
    const words = content.split(' ').slice(0, count);
    return words.map(word => `ما معنى ${word}؟ أ) خيار 1 ب) خيار 2 ج) خيار 3 د) خيار 4`);
}

function generateNumericalQuestions(count) {
    return Array.from({ length: count }, (_, i) => `احسب: ${i + 1} + ${i + 2} = ____`);
}

// دالة لحفظ الأسئلة في ملف نصي
function saveQuestions() {
    const questions = document.getElementById('generatedQuestions').value;

    if (!questions) {
        alert('لا توجد أسئلة لحفظها!');
        return;
    }

    const blob = new Blob([questions], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'الأسئلة.txt';
    link.click();
}
