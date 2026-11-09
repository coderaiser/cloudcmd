const hasName = ({dataset}) => Boolean(dataset?.name);

export const listen = (element, actions, onAction) => {
    const handlers = [];
    
    for (const {event, render} of actions) {
        const handler = ({target}) => {
            if (hasName(target))
                onAction({
                    target,
                    render,
                });
        };
        
        element.addEventListener(event, handler);
        handlers.push([event, handler]);
    }
    
    return () => {
        for (const [event, handler] of handlers)
            element.removeEventListener(event, handler);
    };
};
