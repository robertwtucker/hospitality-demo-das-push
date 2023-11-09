export function getDescription() : ScriptDescription {
    return {
        description: "Project of scripting module."
    };
}

export async function execute(context: Context): Promise<void> {
    console.log("Hello world.");
}
