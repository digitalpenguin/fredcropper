<?php
namespace FredCropper\Endpoint;

abstract class Endpoint
{
    /** @var \modX */
    protected $modx;

    /** @var \Fred */
    protected $fred;

    /** @var \FredCropper */
    protected $fredCropper;

    /**
     * Endpoint constructor.
     * @param \Fred $fred
     * @param \FredCropper $fredCropper
     */
    public function __construct(\Fred &$fred,\FredCropper &$fredCropper)
    {
        $this->fred =& $fred;
        $this->fredCropper =& $fredCropper;
        $this->modx =& $fredCropper->modx;
    }

    abstract function run();
}