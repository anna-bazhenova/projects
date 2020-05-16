var gulp         = require('gulp'),
	path         = require('path'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок для dist
	autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
	svgmin 		 = require('gulp-svgmin'),
	svgstore 	 = require('gulp-svgstore'); // Подключаем svg спрайт

gulp.task('sass', async function() { // Создаем таск Sass
	return gulp.src('app/sass/**/*.sass') // Берем источник
		.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', async function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browser Sync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	})
});

gulp.task('scripts', async function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('svgstore', function () {
	return gulp
		.src('app/img/svg/*.svg')
		.pipe(svgmin(function (file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true
					}
				}]
			}
		}))
		.pipe(svgstore())
		.pipe(gulp.dest('app/img'));
});


gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});


gulp.task('css-libs', function() {
	return gulp.src('app/sass/_libs.sass') // Выбираем файл для минификации
		.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(cssnano()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('clean', async function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('prebuild', async function() {

	var buildCss = gulp.src([ // Переносим CSS стили в продакшен
		'app/css/main.css',
		'app/css/libs.min.css'
	])
		.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
		.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
		.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
		.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('watch', async function() {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('sass')); // Наблюдение за sass файлами
	gulp.watch('app/*.html', gulp.parallel('code')); // Наблюдение за HTML файлами в корне проекта
	gulp.watch(['app/js/common.js', 'app/libs/**/*.js'], gulp.parallel('scripts')); // Наблюдение за главным JS файлом и за библиотеками
});
gulp.task('default', gulp.parallel('css-libs', 'sass', 'svgstore', 'scripts', 'browser-sync', 'watch'));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'svgstore','sass', 'scripts'));