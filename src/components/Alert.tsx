import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';

export interface AlertAction {
    label: string;
    onClick?: () => void;
}

export interface AlertProps {
    title: string;
    message: string;
    actions?: AlertAction[]; // Array of action buttons
    onClose: () => void; // Callback for when the alert is closed
}

const Alert: React.FC<AlertProps> = ({
    title,
    message,
    actions = [{ label: 'Ok', onClick: undefined }],
    onClose,
}) => {
    // Close alert on Escape key press
    useEffect(() => {
        const handleEscPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscPress);
        return () => window.removeEventListener('keydown', handleEscPress);
    }, [onClose]);

    // Close alert on background click
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).dataset.overlay) {
            onClose();
        }
    };

    const handleActionClick = (handler?: () => void) => {
        if (handler) handler();
        onClose();
    };

    // Chakra styles
    const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.700');
    const alertBg = useColorModeValue('white', 'gray.800');

    return (
        <Flex
            data-overlay="true"
            onClick={handleBackgroundClick}
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            bg={overlayBg}
            align="center"
            justify="center"
            zIndex="10000"
        >
            <Box
                bg={alertBg}
                borderRadius="md"
                boxShadow="lg"
                p={6}
                width="90%"
                maxWidth="400px"
                textAlign="center"
            >
                <VStack spacing={4}>
                    {/* Title */}
                    <Heading as="h2" size="md">
                        {title}
                    </Heading>
                    {/* Message */}
                    <Text>{message}</Text>
                    {/* Actions */}
                    <Flex justify="center" gap={3}>
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                onClick={() => handleActionClick(action.onClick)}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Flex>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Alert;
