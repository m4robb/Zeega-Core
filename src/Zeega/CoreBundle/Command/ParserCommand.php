<?php

// src/Acme/DemoBundle/Command/GreetCommand.php
namespace Zeega\CoreBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\FormatterHelper;
use Symfony\Component\Console\Helper\DialogHelper;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;

use Zeega\CoreBundle\Generator\ParserGenerator;
use Zeega\CoreBundle\Generator\Generator;


class ParserCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('zeega:parser')
            ->setDescription('Greet someone')
            //->addArgument('name', InputArgument::OPTIONAL, 'Who do you want to greet?')
            ->addOption('yell', null, InputOption::VALUE_NONE, 'If set, the task will yell in uppercase letters')
            ->setDefinition(array(
                new InputOption('namespace', '', InputOption::VALUE_REQUIRED, 'The namespace of the bundle to create'),
                new InputOption('dir', '', InputOption::VALUE_REQUIRED, 'The directory where to create the bundle'),
                new InputOption('bundle-name', '', InputOption::VALUE_REQUIRED, 'The optional bundle name'),
                new InputOption('format', '', InputOption::VALUE_REQUIRED, 'Use the format for configuration files (php, xml, yml, or annotation)', 'annotation'),
                new InputOption('structure', '', InputOption::VALUE_NONE, 'Whether to generate the whole directory structure')))
            ->setHelp(<<<EOT
The <info>generate:bundle</info> command helps you generates new bundles.

By default, the command interacts with the developer to tweak the generation.
Any passed option will be used as a default value for the interaction
(<comment>--namespace</comment> is the only one needed if you follow the
conventions):

<info>php app/console generate:bundle --namespace=Acme/BlogBundle</info>

Note that you can use <comment>/</comment> instead of <comment>\\</comment> for the namespace delimiter to avoid any
problem.

If you want to disable any user interaction, use <comment>--no-interaction</comment> but don't forget to pass all needed options:

<info>php app/console generate:bundle --namespace=Acme/BlogBundle --dir=src [--bundle-name=...] --no-interaction</info>

Note that the bundle namespace must end with "Bundle".
EOT
                )
            
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $generator = new ParserGenerator($this->getContainer()->get('filesystem'), __DIR__.'/../Resources/templates/generator');
        $dialog = $this->getHelperSet()->get('dialog');
        
        $style = new OutputFormatterStyle();
        $style->setBackground('blue');
        $output->getFormatter()->setStyle('fire', $style);
        $style->setBackground('red');
        $output->getFormatter()->setStyle('red', $style);
        
        $output->writeln(array(
            '',
            '<fire>                                   </fire>',
            '<fire> Welcome to Zeega parser generator </fire>',
            '<fire>                                   </fire>'),
            '');
        
        
        //$dialog = $this->getHelperSet()->get('dialog');
        $name = $dialog->ask($output, '<red>Please enter the name of your Parser: </red>', '');
        
        $namespace = $input->getOption('namespace');
        if (!$bundle = $input->getOption('bundle-name')) 
        {
                    $bundle = strtr($namespace, array('\\' => ''));
        }
    }
    
    protected function getGenerator()
    {
        
        return $this->generator;
    }    
}
