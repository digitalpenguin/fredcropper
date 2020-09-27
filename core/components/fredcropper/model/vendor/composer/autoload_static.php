<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit6cdc13c7c3067761f0bd8d74f93af378
{
    public static $prefixLengthsPsr4 = array (
        'F' => 
        array (
            'FredCropper\\' => 12,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'FredCropper\\' => 
        array (
            0 => __DIR__ . '/../..' . '/fredcropper/src',
        ),
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit6cdc13c7c3067761f0bd8d74f93af378::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit6cdc13c7c3067761f0bd8d74f93af378::$prefixDirsPsr4;

        }, null, ClassLoader::class);
    }
}