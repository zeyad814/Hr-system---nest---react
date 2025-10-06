const fs = require('fs');
const path = require('path');

// مسارات الملفات
const FRONTEND_SRC_PATH = '/Users/md/Documents/GitHub/hr-project/front-end/src';
const LANGUAGE_CONTEXT_PATH = '/Users/md/Documents/GitHub/hr-project/front-end/src/contexts/LanguageContext.tsx';
const OUTPUT_FILE = '/Users/md/Documents/GitHub/hr-project/missing-translation-keys.txt';

// دالة لاستخراج مفاتيح الترجمة من النص
function extractTranslationKeys(content) {
  const keys = new Set();
  
  // البحث عن نمط t('key') أو t("key")
  const regex = /t\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return Array.from(keys);
}

// دالة للبحث في جميع ملفات TSX
function findTsxFiles(dir) {
  const files = [];
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // تجاهل مجلدات node_modules و .git
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          searchDirectory(fullPath);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDirectory(dir);
  return files;
}

// دالة لاستخراج المفاتيح الموجودة في LanguageContext
function getExistingKeys(languageContextPath) {
  const existingKeys = new Set();
  
  try {
    const content = fs.readFileSync(languageContextPath, 'utf8');
    
    // البحث عن المفاتيح في كائن الترجمة العربية
    const arTranslationMatch = content.match(/ar:\s*\{([\s\S]*?)\}\s*,\s*en:/s);
    
    if (arTranslationMatch) {
      const arContent = arTranslationMatch[1];
      
      // استخراج المفاتيح من النص
      const keyRegex = /['"]([^'"]+)['"]\s*:/g;
      let match;
      
      while ((match = keyRegex.exec(arContent)) !== null) {
        existingKeys.add(match[1]);
      }
    }
  } catch (error) {
    console.error('خطأ في قراءة ملف LanguageContext:', error.message);
  }
  
  return existingKeys;
}

// الدالة الرئيسية
function main() {
  console.log('🔍 بدء البحث عن مفاتيح الترجمة...');
  
  // العثور على جميع ملفات TSX
  const tsxFiles = findTsxFiles(FRONTEND_SRC_PATH);
  console.log(`📁 تم العثور على ${tsxFiles.length} ملف TSX/TS`);
  
  // استخراج جميع مفاتيح الترجمة
  const allKeys = new Set();
  const fileKeysMap = new Map();
  
  for (const file of tsxFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const keys = extractTranslationKeys(content);
      
      if (keys.length > 0) {
        fileKeysMap.set(file, keys);
        keys.forEach(key => allKeys.add(key));
      }
    } catch (error) {
      console.error(`خطأ في قراءة الملف ${file}:`, error.message);
    }
  }
  
  console.log(`🔑 تم العثور على ${allKeys.size} مفتاح ترجمة فريد`);
  
  // الحصول على المفاتيح الموجودة في LanguageContext
  const existingKeys = getExistingKeys(LANGUAGE_CONTEXT_PATH);
  console.log(`✅ تم العثور على ${existingKeys.size} مفتاح موجود في LanguageContext`);
  
  // العثور على المفاتيح المفقودة
  const missingKeys = Array.from(allKeys).filter(key => !existingKeys.has(key));
  
  console.log(`❌ تم العثور على ${missingKeys.length} مفتاح مفقود`);
  
  // إنشاء تقرير مفصل
  let report = '=== تقرير مفاتيح الترجمة المفقودة ===\n\n';
  report += `تاريخ التقرير: ${new Date().toLocaleString('ar-SA')}\n`;
  report += `إجمالي المفاتيح المستخدمة: ${allKeys.size}\n`;
  report += `المفاتيح الموجودة: ${existingKeys.size}\n`;
  report += `المفاتيح المفقودة: ${missingKeys.length}\n\n`;
  
  if (missingKeys.length > 0) {
    report += '=== المفاتيح المفقودة ===\n';
    missingKeys.sort().forEach(key => {
      report += `- ${key}\n`;
    });
    
    report += '\n=== تفاصيل استخدام المفاتيح المفقودة ===\n';
    for (const [file, keys] of fileKeysMap) {
      const fileMissingKeys = keys.filter(key => missingKeys.includes(key));
      if (fileMissingKeys.length > 0) {
        const relativePath = path.relative(FRONTEND_SRC_PATH, file);
        report += `\n📄 ${relativePath}:\n`;
        fileMissingKeys.forEach(key => {
          report += `  - ${key}\n`;
        });
      }
    }
    
    report += '\n=== مقترح إضافة المفاتيح (تنسيق JSON) ===\n';
    missingKeys.forEach(key => {
      report += `    '${key}': 'ترجمة ${key}',\n`;
    });
  } else {
    report += '🎉 جميع المفاتيح موجودة في ملف الترجمة!';
  }
  
  // حفظ التقرير
  fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
  
  console.log(`\n📊 تم إنشاء التقرير في: ${OUTPUT_FILE}`);
  
  if (missingKeys.length > 0) {
    console.log('\n❗ المفاتيح المفقودة:');
    missingKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (missingKeys.length > 10) {
      console.log(`  ... و ${missingKeys.length - 10} مفتاح آخر`);
    }
  }
  
  console.log('\n✅ تم الانتهاء من التحليل!');
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = {
  extractTranslationKeys,
  findTsxFiles,
  getExistingKeys
};