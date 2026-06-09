import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
    toggleThemeFromPoint: (x: number, y: number) => void;
    isSwitching: boolean;
}>({ theme: 'dark', toggleTheme: () => {}, toggleThemeFromPoint: () => {}, isSwitching: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('gitrid-theme') as Theme) ?? 'dark';
    });
    const [isSwitching, setIsSwitching] = useState(false);
    const switchingRef = useRef(false);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('gitrid-theme', theme);
    }, [theme]);

    const applyTheme = (next: Theme) => {
        setTheme(next);
    };

    const toggleThemeFromPoint = (x: number, y: number) => {
        if (switchingRef.current) return;

        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Fallback: no View Transition API
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => {
                ready: Promise<void>;
                finished: Promise<void>;
            };
        };

        if (prefersReduced || !doc.startViewTransition) {
            applyTheme(next);
            return;
        }

        switchingRef.current = true;
        setIsSwitching(true);

        const maxH = Math.max(x, window.innerWidth - x);
        const maxV = Math.max(y, window.innerHeight - y);
        const endRadius = Math.hypot(maxH, maxV);

        const transition = doc.startViewTransition!(() => {
            applyTheme(next);
        });

        transition.ready
            .then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 480,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
            })
            .catch(() => applyTheme(next));

        transition.finished.finally(() => {
            switchingRef.current = false;
            setIsSwitching(false);
        });
    };

    const toggleTheme = () => {
        // Plain toggle without positional ripple (fallback)
        toggleThemeFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, toggleThemeFromPoint, isSwitching }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
